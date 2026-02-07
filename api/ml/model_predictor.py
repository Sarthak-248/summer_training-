import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pytesseract
from pdf2image import convert_from_path
from PIL import Image, UnidentifiedImageError
import sys
import json
import os
import re
import io
import mimetypes
import traceback
import warnings

# Suppress sklearn warnings about version mismatch
warnings.filterwarnings("ignore")

# Ensure proper stdout encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# === Configurations ===

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # from ml/ to api/

# Handle Paths based on OS
if os.name == 'nt': # Windows
    # Common locations for Poppler - try to detect or use default
    possible_poppler_paths = [
        r"C:\Program Files\poppler-24.08.0\Library\bin",
        r"C:\Program Files (x86)\poppler-24.08.0\Library\bin",
        r"C:\poppler-24.08.0\Library\bin",
    ]
    POPPLER_PATH = None
    for p in possible_poppler_paths:
        if os.path.exists(p):
            POPPLER_PATH = p
            break
            
    # Tesseract path
    TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(TESSERACT_PATH):
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
    else:
        # Fallback or let it fail if not in PATH
        pass
else: # Linux / Docker
    POPPLER_PATH = None # pdf2image finds it in PATH
    TESSERACT_PATH = "/usr/bin/tesseract" # Standard location
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

MODEL_PATH = os.path.join(BASE_DIR, "rf_model.joblib")
LABEL_ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.joblib")
DATASET_PATH = os.path.join(BASE_DIR, "cbc_health_severity_dataset.csv")

# === Feature Mapping ===
# Maps the strict model feature names (keys) to list of possible regex patterns (values)
FIELD_ALIASES = {
    "Hemoglobin (g/dL)": [r"Hemoglobin", r"Hb", r"Hgb"],
    "WBC (cells/µL)": [r"WBC", r"White Blood Cell", r"TLC", r"Total Leucocyte Count"],
    "RBC (million/µL)": [r"RBC", r"Red Blood Cell", r"Total RBC", r"Erythrocyte Count"],
    "Hematocrit (%)": [r"Hematocrit", r"PCV", r"Packed Cell Volume", r"Hct"],
    "MCV (fL)": [r"MCV", r"Mean Corpuscular Volume"],
    "MCH (pg)": [r"MCH", r"Mean Corpuscular Hemoglobin"],
    "MCHC (g/dL)": [r"MCHC", r"Mean Corpuscular Hemoglobin Concentration"],
    "Platelet Count (cells/µL)": [r"Platelet Count", r"PLT", r"Platelets", r"Thrombocyte Count"],
    "RDW (%)": [r"RDW", r"Red Cell Distribution Width"],
    "Neutrophils (%)": [r"Neutrophils", r"Polymorphs"],
    "Lymphocytes (%)": [r"Lymphocytes"],
    "Monocytes (%)": [r"Monocytes"],
    "Eosinophils (%)": [r"Eosinophils"],
    "Basophils (%)": [r"Basophils"]
}

def get_medians(dataset_path):
    try:
        df = pd.read_csv(dataset_path)
        medians = {}
        # Columns in CSV might slightly differ in naming convention, but based on reading it matches keys mostly
        # We only care about the features used in the model
        for col in df.columns:
             if col in FIELD_ALIASES: # Simple check if it's one of our feature keys
                 medians[col] = df[col].median()
        return medians
    except Exception as e:
        print(f"⚠️ Warning: Could not calculate medians from dataset: {e}", file=sys.stderr)
        return {}


def is_pdf(file_path):
    ext = os.path.splitext(file_path)[-1].lower()
    mime, _ = mimetypes.guess_type(file_path)
    if ext == ".pdf" or mime == "application/pdf":
        return True
    try:
        with open(file_path, "rb") as f:
            header = f.read(4)
            if header == b"%PDF":
                return True
    except Exception:
        pass
    return False

def extract_text(path):
    try:
        print(f"📁 File received: {path}", file=sys.stderr)

        if is_pdf(path):
            print("📄 Detected PDF. Converting to images...", file=sys.stderr)
            try:
                pages = convert_from_path(path, poppler_path=POPPLER_PATH)
            except Exception as e:
                # If poppler missing, provide clear error
                if "poppler" in str(e).lower() or "not installed" in str(e).lower():
                    raise Exception("Poppler is not installed or not found. Please install Poppler for PDF support.")
                raise e
            
            print(f"✅ Converted {len(pages)} page(s) to images.", file=sys.stderr)
            text = "\n".join(pytesseract.image_to_string(img) for img in pages)
        else:
            print("🖼️ Detected image file. Extracting text...", file=sys.stderr)
            try:
                image = Image.open(path)
                text = pytesseract.image_to_string(image)
            except UnidentifiedImageError:
                raise Exception("Unrecognized image format. Ensure it is a valid image or PDF.")

        # print("🔍 OCR Text Preview:\n", text[:300], "...", file=sys.stderr)
        return text

    except Exception as e:
        print(json.dumps({
            "error": f"Failed to extract text from file: {str(e)}",
            "trace": traceback.format_exc()
        }))
        # Exit carefully
        sys.exit(1)

def clean_ocr_text(text):
    # Normalize common OCR mistakes in units
    replacements = {
        r"cells\s*/\s*[pPμµuU]?[lL]": "cells/µL",
        r"cells\s*/\s*ul": "cells/µL",
        r"million\s*/\s*[pPμµuU]?[lL]": "million/µL",
        r"\bfl\b": "fL",
        r"\bg/dl\b": "g/dL",
    }
    
    for wrong, right in replacements.items():
        text = re.sub(wrong, right, text, flags=re.IGNORECASE)
    return text

def extract_fields(text, columns):
    fields = []
    
    # Iterate through the columns the MODEL expects
    for field in columns:
        val = None
        
        # Get list of regex aliases for this field
        # If strict match not found in mapping, default to just the field name
        patterns_to_try = FIELD_ALIASES.get(field, [re.escape(field)])
        
        for alias_pattern in patterns_to_try:
            # Construct regex:
            # 1. Alias (case insensitive)
            # 2. Match anything that isn't a newline (skip labels, units, separators)
            # 3. Capture the number (float or with comma)
            
            # Allow common separators like : - = or just spaces
            # The key change: allow '.' or ',' as decimal separator
            
            regex = rf"{alias_pattern}.*?([\d]+[.,]?[\d]*)"
            
            match = re.search(regex, text, re.IGNORECASE)
            if match:
                try:
                    val_str = match.group(1).replace(',', '.')
                    val_str = val_str.rstrip('.') # Remove trailing dot if it picked up a sentence end
                    val = float(val_str)
                    print(f"✅ Found value for '{field}' using alias '{alias_pattern}': {val}", file=sys.stderr)
                    break # Stop trying other aliases for this field
                except ValueError:
                    continue
        
        if val is None:
            print(f"❌ Missing value for: {field}", file=sys.stderr)
        
        fields.append(val)
        
    return fields

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "File path not provided."}))
            sys.exit(1)

        file_path = sys.argv[1]

        if not os.path.isfile(file_path):
            print(json.dumps({"error": "File not found."}))
            sys.exit(1)

        if not os.path.exists(MODEL_PATH) or not os.path.exists(LABEL_ENCODER_PATH):
            print(json.dumps({"error": "Model or label encoder file missing."}))
            sys.exit(1)

        try:
            model = joblib.load(MODEL_PATH)
            le = joblib.load(LABEL_ENCODER_PATH)
            print("✅ Model and label encoder loaded successfully.", file=sys.stderr)
        except Exception as e:
            print(json.dumps({"error": f"Failed to load model or encoder: {str(e)}"}))
            sys.exit(1)

        # Calculate/Load medians
        feature_medians = get_medians(DATASET_PATH)

        # Run OCR
        text = extract_text(file_path)
        text = clean_ocr_text(text)
        
        # Extract features
        input_vals = extract_fields(text, model.feature_names_in_)

        # Impute missing values with medians
        imputed_fields = []
        final_input_vals = []
        
        for name, val in zip(model.feature_names_in_, input_vals):
            if val is None:
                if name in feature_medians:
                    median_val = feature_medians[name]
                    final_input_vals.append(median_val)
                    imputed_fields.append(name)
                    print(f"⚠️ Missing '{name}', using median: {median_val}", file=sys.stderr)
                else:
                    # Fallback if median not found
                    # We can't proceed if we don't have a value
                    print(json.dumps({
                        "error": f"Critical missing value for '{name}' and no median available in dataset.",
                        "ocr_text_preview": text[:500]
                    }))
                    sys.exit(1)
            else:
                final_input_vals.append(val)

        # Predict
        # Create DataFrame with correct column names
        input_data = pd.DataFrame([final_input_vals], columns=model.feature_names_in_)
        
        prediction = model.predict(input_data)
        prediction_label = le.inverse_transform(prediction)[0]
        
        # Also get probability if possible
        confidence = 100
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(input_data)
            confidence = round(max(probs[0]) * 100, 2)

        result = {
            "prediction": prediction_label,
            "confidence": confidence,
            "extracted_data": dict(zip(model.feature_names_in_, final_input_vals)),
            "imputed_fields": imputed_fields
        }
        
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({
            "error": f"Script failed: {str(e)}",
            "trace": traceback.format_exc()
        }))
        sys.exit(1)

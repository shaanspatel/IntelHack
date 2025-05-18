import cv2
import pytesseract
import sys
import os
from openai import OpenAI

#Preprocess and OCR
def preprocess_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Image not found: {image_path}")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    denoised = cv2.medianBlur(thresh, 3)
    return denoised

def extract_text(image_path):
    processed_img = preprocess_image(image_path)
    config = '--oem 3 --psm 6'
    return pytesseract.image_to_string(processed_img, config=config)

# Send to LLM
def classify_text(raw_text, api_key):
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )

    response = client.chat.completions.create(
        extra_body={},
        model="deepseek/deepseek-r1:free",
        messages=[
            {
                "role": "user",
                "content": (
                    "I have given you a raw text extraction of a receipt. "
                    "Can you please figure out which of the following budget categories it belongs to: "
                    "Entertainment/Subscription, Dining, Groceries, Clothing, Personal Care, Miscellaneous Items. "
                    "Only if you are sure also find the total amount spent. Simply output the budget category space and then the total amount spent (only if positive that it was given) and nothing else.\n\n"
                    f"Here is the given input: {raw_text}"
                )
            }
        ]
    )
    return response.choices[0].message.content.strip()

# Main
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python process_receipt.py <path_to_image>")
        sys.exit(1)

    image_path = sys.argv[1]
    api_key = "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"  # Replace or load securely

    try:
        text = extract_text(image_path)
        category = classify_text(text, api_key)
        print(f"{category}")
    except Exception as e:
        print("Miscallaneous Items")

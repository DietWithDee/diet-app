import os
import sys
import io
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import pypdfium2 as pdfium
from PIL import Image

BASE_DIR = r"C:\Users\gokro\Downloads"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "plan-previews")
os.makedirs(OUT_DIR, exist_ok=True)

PLANS = [
    {
        "id": "back-to-basics",
        "file": "Back To Basics.pdf",
        "pages": [6, 7], # 1-based: Portion Guide (p6), Day 1 Meal Plan (p7)
        "labels": ["Portion & Structure Guide", "Day 1 Sample Meal Plan"]
    },
    {
        "id": "snatched-nourished",
        "file": "Snatched & Nourished.pdf",
        "pages": [4, 11], # 1-based: Menu 1 Meals (p4), Grocery List (p11)
        "labels": ["Sample Balanced Menu", "Comprehensive Grocery List"]
    },
    {
        "id": "blood-sugar-balance",
        "file": "Blood Sugar Balance.pdf",
        "pages": [5, 6], # 1-based: Blood Sugar Friendly Plate (p5), Easy-To-Follow Meal Plan (p6)
        "labels": ["The Blood Sugar-Friendly Plate Method", "Easy-to-Follow Diabetes Meal Plan"]
    },
    {
        "id": "pressure-no-dey-catch-me",
        "file": "Pressure No Dey catch Me.pdf",
        "pages": [5, 8], # 1-based: Heart-Smart Meal Plan (p5), Salt-Smart Tips (p8)
        "labels": ["Heart-Smart Daily Menu", "Salt-Smart Cooking Guide"]
    },
    {
        "id": "weight-gain",
        "file": "The Weight Gain  Wahala-Free Plan.pdf",
        "pages": [5, 10], # 1-based: High Calorie Meal Plan (p5), Foods Cheat Sheet (p10)
        "labels": ["High-Calorie Structured Meal Plan", "Weight Gain Foods Cheat Sheet"]
    }
]

def main():
    print("🚀 Extracting high-res screenshots from all 5 Plan PDFs...")
    for plan in PLANS:
        pdf_path = os.path.join(BASE_DIR, plan["file"])
        if not os.path.exists(pdf_path):
            print(f"❌ File not found: {pdf_path}")
            continue

        pdf = pdfium.PdfDocument(pdf_path)
        print(f"\n📖 Processing {plan['id']} ({plan['file']})...")

        for i, page_num in enumerate(plan["pages"]):
            idx = page_num - 1 # 0-based
            page = pdf.get_page(idx)
            # Render at scale 2.0 (crisp high-DPI quality, ~1400-1600px width)
            image = page.render(scale=2.0).to_pil()

            out_filename = f"{plan['id']}-preview-{i+1}.webp"
            out_path = os.path.join(OUT_DIR, out_filename)
            
            # Save as optimized WebP
            image.save(out_path, format="WEBP", quality=88, method=6)
            print(f"  ✅ Saved Page {page_num} -> {out_filename} ({image.size[0]}x{image.size[1]})")

    print("\n🎉 All 10 screenshots generated successfully in src/assets/plan-previews/!")

if __name__ == "__main__":
    main()

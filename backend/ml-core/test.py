# check_columns.py
import pandas as pd

print("Checking dataset columns...")

with open(r"C:\Users\PC\Downloads\df_onehot_encoded_word_level_FULL.csv", 'r', encoding='utf-8') as f:
    lines = [f.readline() for _ in range(2)]  # Read just header and first line

column_names = lines[0].strip().split(';')
first_row = lines[1].strip().split(';') if len(lines) > 1 else []

print(f"Total columns: {len(column_names)}")
print("\nColumns that might contain coordinates:")
coord_cols = [col for col in column_names if any(word in col.lower() for word in ['lat', 'long', 'lng', 'coord', 'location'])]
for col in coord_cols:
    print(f"  - {col}")

print("\nFirst few columns:")
for i, col in enumerate(column_names[:20]):
    print(f"  {i}: {col}")

# Check if we have actual coordinate data
if 'latitude' in [col.lower() for col in column_names] and 'longitude' in [col.lower() for col in column_names]:
    print("\n✅ Found latitude and longitude columns!")
else:
    print("\n❌ No latitude/longitude columns found")
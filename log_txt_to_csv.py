import csv
import os

def extract_subarrays(file_path):
    subarrays = []
    with open(file_path, 'r') as file:
        for line in file:
            # Skip lines that do not contain the JSON data
            if not line.startswith("Parsed JSON:"):
                continue
            
            # Extract the JSON part
            json_part = line.split("Parsed JSON: ")[1]
            # Use regex to find all subarrays
            matches = json_part.strip().strip('[]').split('], [')
            for match in matches:
                # Ensure the match is a valid subarray string
                subarray = match.strip().strip('[]')
                subarrays.append(subarray)
    
    return subarrays

def split_subarray(subarray):
    # Split the subarray string into individual elements
    elements = []
    current_element = ''
    in_quotes = False
    for char in subarray:
        if char == "'":
            in_quotes = not in_quotes
        if char == ',' and not in_quotes:
            elements.append(current_element.strip())
            current_element = ''
        else:
            current_element += char
    elements.append(current_element.strip())
    return elements

def write_to_csv(subarrays, csv_file_path):
    try:
        with open(csv_file_path, 'w', newline='') as csvfile:
            csvwriter = csv.writer(csvfile)
            for subarray in subarrays:
                # Split the subarray string into individual elements
                row = split_subarray(subarray)
                csvwriter.writerow(row)
    except PermissionError as e:
        print(f"Permission denied: {e}")
        print("Please ensure the output directory exists and you have write permissions.")
    except Exception as e:
        print(f"An error occurred while writing to the CSV file: {e}")

def main():
    input_file_path = os.path.abspath("C:/Users/HP/Downloads/game_log3.txt")
    output_csv_path = os.path.abspath("C:/Users/HP/Desktop/IIIT-Classes/Sem 7/STAI/Project/Data/gamelog.csv")
    
    # Ensure the output directory exists
    output_dir = os.path.dirname(output_csv_path)
    if not os.path.exists(output_dir):
        print(f"Output directory does not exist: {output_dir}")
        print("Creating the output directory...")
        os.makedirs(output_dir)
    
    subarrays = extract_subarrays(input_file_path)
    write_to_csv(subarrays, output_csv_path)
    
    print(f"Data has been successfully written to {output_csv_path}")

if __name__ == "__main__":
    main()
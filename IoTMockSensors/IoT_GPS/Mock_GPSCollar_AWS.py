import time
from gps_collar_logic import generate_bulk_data

# Constants
NUM_ELKS = 20  # Number of elk to simulate

# Generate bulk data for all elks
bulk_data = generate_bulk_data(NUM_ELKS)

# Simulate sending each line of GPS data to AWS every 20 seconds
for data_point in bulk_data:
    # Here you would send the data to AWS
    # Simulate sending to AWS by printing
    print(f"Sending to AWS: {data_point}")
    time.sleep(2)  # Wait for 20 seconds before sending the next point

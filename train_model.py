import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# Create output folder if it doesn't exist
os.makedirs("src/main/resources/models", exist_ok=True)

# 1. Generate virtual customer churn data
np.random.seed(42)
n_samples = 1000

data = pd.DataFrame({
    'recency': np.random.randint(0, 30, n_samples),
    'frequency_monthly': np.random.randint(0, 25, n_samples),
    'frequency_weekly': np.random.randint(0, 7, n_samples),
    'visit_drop_rate': np.random.uniform(-1.0, 0.5, n_samples),
    'contract_period': np.random.choice([1, 3, 6, 12], n_samples),
    'age': np.random.randint(18, 65, n_samples),
    'is_locker_used': np.random.choice([0, 1], n_samples),
    'is_clothes_used': np.random.choice([0, 1], n_samples)
})

# Rules for churn: low frequency + high recency + short contract
data['churned'] = ((data['recency'] > 15) & (data['frequency_monthly'] < 5) & (data['contract_period'] <= 3)).astype(int)

# Split features and target
X = data.drop(columns=['churned']).astype(np.float32)
y = data['churned']

# 2. Train Model using RandomForestClassifier (natively supported by skl2onnx)
model = RandomForestClassifier(max_depth=4, n_estimators=50, random_state=42)
model.fit(X, y)

# 3. Export to ONNX
initial_type = [('float_input', FloatTensorType([None, 8]))]
onnx_model = convert_sklearn(model, initial_types=initial_type)

onnx_path = "src/main/resources/models/gym_churn_model.onnx"
with open(onnx_path, "wb") as f:
    f.write(onnx_model.SerializeToString())

print(f"Model successfully converted and saved as '{onnx_path}'")

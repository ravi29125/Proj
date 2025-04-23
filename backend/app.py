from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import google.generativeai as genai
import pandas as pd
from ctgan import CTGAN


app = Flask(__name__)
CORS(app)


@app.route('/', methods=['POST','GET'])
def receive():
    p2 = request.form.get('str')
    input_num = int(request.form.get('num'))
    p1 = 'Generate 100 rows of fake data in this CSV format:'

    p3='Only output raw CSV data (no explanations).'

    prompt=p1+p2+p3
    
    genai.configure(api_key="AIzaSyC-QFcJGvAABRR7JvouXjmUTb75JZ2oMew")

    model = genai.GenerativeModel(model_name="models/gemini-1.5-pro-latest")
    response = model.generate_content(prompt)
    csv_data = response.text.strip()
    lines = csv_data.splitlines()
    columns = lines[0].split(",")
    data = [line.split(",") for line in lines[1:]]
    df = pd.DataFrame(data, columns=columns)
    model = CTGAN(verbose=True)
    categorical_columns = df.select_dtypes(include=['object']).columns.tolist()
    model.fit(df,categorical_columns)
    synthetic_data = model.sample(input_num)
    return jsonify(synthetic_data.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)
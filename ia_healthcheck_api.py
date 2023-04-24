import pandas as pd
from flask import Flask, jsonify
from flask_restful import Api, Resource, reqparse
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

app = Flask(__name__)
api = Api(app)

data = pd.read_csv('data/GPT4/BASE_GRAU_DE_RISCO_SITOMAS.CSV', delimiter=';', low_memory=False, encoding='UTF-8')

X = data[['Descricao do Procedimento', 'Descricao do CID']]
y = LabelEncoder().fit_transform(data['Descricao do Procedimento'])

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(X.apply(lambda x: ' '.join(x), axis=1))
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)

def create_scenarios(descricao_cid):    
    new_data = [descricao_cid]
    new_data_vectorized = vectorizer.transform(new_data)
    predicted_class = model.predict(new_data_vectorized)
    predicted_description = LabelEncoder().fit(data['Descricao do Procedimento']).inverse_transform(predicted_class)
    print(f"A descricao do procedimento para a descricao do CID '{new_data[0]}' é '{predicted_description[0]}'")
    print("-----------------------------------------------------------------------------------------------------------------")
    return predicted_description[0]

# Create parser for the payload data
parser = reqparse.RequestParser()
parser.add_argument('data')

# Define how the api will respond to the post requests
class RiskClassifier(Resource):
    def post(self):
        args = parser.parse_args()
        symptoms = args['data']
        print(symptoms)  
        predicted_description = create_scenarios(symptoms)
        return jsonify(predicted_description)

api.add_resource(RiskClassifier, '/consult')
app.run(debug=True)

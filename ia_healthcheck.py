import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

data = pd.read_csv('data/GPT4/BASE_GRAU_DE_RISCO_SITOMAS.CSV', delimiter=';', low_memory=False, encoding='UTF-8')

# data['Descrição do CID'].fillna(value='SEM INFORMAÇÃO', inplace=True)
# data['Descrição do Procedimento'].fillna(value='PROCEDIMENTO DESCONHECIDO', inplace=True)
print(data);

X = data[['Descricao do Procedimento', 'Descricao do CID']]
y = LabelEncoder().fit_transform(data['Descricao do Procedimento'])

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(X.apply(lambda x: ' '.join(x), axis=1))
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Acurácia: {accuracy}")

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

def create_scenarios(descricao_cid):    
    new_data = [descricao_cid]
    new_data_vectorized = vectorizer.transform(new_data)
    predicted_class = model.predict(new_data_vectorized)
    predicted_description = LabelEncoder().fit(data['Descricao do Procedimento']).inverse_transform(predicted_class)
    print(f"A descricao do procedimento para a descricao do CID '{new_data[0]}' é '{predicted_description[0]}'")

create_scenarios('FEBRE BAIXA') # A descricao do procedimento para a descricao do CID 'FEBRE BAIXA' é 'GRAU DE RISCO BAIXO'
create_scenarios('FEBRE MODERADA') # A descricao do procedimento para a descricao do CID 'FEBRE MODERADA' é 'GRAU DE RISCO MODERADO'
create_scenarios('FEBRE ALTA') # A descricao do procedimento para a descricao do CID 'FEBRE ALTA' é 'GRAU DE RISCO ALTO'

create_scenarios('febre baixa') # A descricao do procedimento para a descricao do CID 'febre baixa' é 'GRAU DE RISCO BAIXO'
create_scenarios('febre moderada') # A descricao do procedimento para a descricao do CID 'febre moderada' é 'GRAU DE RISCO MODERADO'
create_scenarios('febre alta') # A descricao do procedimento para a descricao do CID 'febre alta' é 'GRAU DE RISCO ALTO'

create_scenarios('NAUSEA') # A descricao do procedimento para a descricao do CID 'NAUSEA' é 'GRAU DE RISCO BAIXO'
create_scenarios('NAUSEA MODERADA') # A descricao do procedimento para a descricao do CID 'NAUSEA MODERADA' é 'GRAU DE RISCO MODERADO'
create_scenarios('DOR DE CABEÇA INTENSA, NAUSEA E VOMITO') # A descricao do procedimento para a descricao do CID 'DOR DE CABEÇA INTENSA, NAUSEA E VOMITO' é 'GRAU DE RISCO ALTO'

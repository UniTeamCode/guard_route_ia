import os
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

data = pd.read_csv('data/GPT4/BASE_GRAU_DE_RISCO_SITOMAS.CSV', delimiter=';', low_memory=False, encoding='UTF-8')

for i, j in data.iterrows():
    print(i, j)
    print()

# data['Descricao do CID'].fillna(value='SEM INFORMACAO', inplace=True)
# data['Descricao do Procedimento'].fillna(value='PROCEDIMENTO DESCONHECIDO', inplace=True)

X = data[['Descricao do Procedimento', 'Descricao do CID']]
y = LabelEncoder().fit_transform(data['Descricao do Procedimento'])

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(X.apply(lambda x: ' '.join(x), axis=1))
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)

os.system("clear")

def create_scenarios(descricao_cid):    
    new_data = [descricao_cid]
    new_data_vectorized = vectorizer.transform(new_data)
    predicted_class = model.predict(new_data_vectorized)
    predicted_description = LabelEncoder().fit(data['Descricao do Procedimento']).inverse_transform(predicted_class)
    print(f"A descricao do procedimento para a descricao do CID '{new_data[0]}' é '{predicted_description[0]}'")
    print("-----------------------------------------------------------------------------------------------------------------")

def conversation():
    question = True
    while question == True:
        print("Olá, por favor me passe uma descrição dos seus sintomas:")
        sintoma = input()
        create_scenarios(sintoma)
        question = dialog()
            
def dialog():
    yes_no = input("Deseja continuar a conversa? [Y/n](Yes):")
    if yes_no in ['Y', 'y', '']:
        os.system("clear")
        return True
    elif yes_no in ['N', 'n']:
        print("Bye!")
        return False
    else:
        print("Valor incorreto")
        return dialog()

conversation()


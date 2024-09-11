#!/usr/bin/env python
# coding: utf-8

# In[133]:


import numpy as np
import pandas as pd
import sklearn.datasets as dt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import tensorflow as tf 
tf.random.set_seed(3)
from tensorflow import keras


# In[ ]:


breast_cancer = dt.load_breast_cancer()
df = pd.DataFrame(breast_cancer.data, columns = breast_cancer.feature_names)
df['target'] = breast_cancer.target
df.shape


# In[ ]:


df.info()


# In[ ]:


# checking for missing values
df.isnull().sum()


# In[ ]:


df.describe()


# In[ ]:


df['target'].value_counts()


# In[ ]:


df.groupby('target').mean()


# In[140]:


X = df.drop('target', axis = 1)
y = df['target']


# In[141]:


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=2)


# In[142]:


scaler = StandardScaler()

X_train_std = scaler.fit_transform(X_train)

X_test_std = scaler.transform(X_test)


# In[ ]:


# setting up the layers of Neural Network

model = keras.Sequential([
                          keras.layers.Flatten(input_shape=(30,)),
                          keras.layers.Dense(20, activation='relu'),
                          keras.layers.Dense(2, activation='relu')
])


# In[144]:


# compiling the Neural Network

model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])


# In[ ]:


# training the Meural Network

history = model.fit(X_train_std, y_train, validation_split=0.1, epochs=10)


# In[ ]:


plt.plot(history.history['accuracy'])
plt.plot(history.history['val_accuracy'])

plt.title('model accuracy')
plt.ylabel('accuracy')
plt.xlabel('epoch')

plt.legend(['training data', 'validation data'], loc = 'lower right')


# In[ ]:


plt.plot(history.history['loss'])
plt.plot(history.history['val_loss'])

plt.title('model loss')
plt.ylabel('loss')
plt.xlabel('epoch')

plt.legend(['training data', 'validation data'], loc = 'upper right')


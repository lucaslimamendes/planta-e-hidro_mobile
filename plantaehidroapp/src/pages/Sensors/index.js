/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useCallback, useState } from 'react';
import { Text, ScrollView, View, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  TextInput,
  Button,
  Card,
  Provider,
  Portal,
  Dialog,
  DefaultTheme,
} from 'react-native-paper';
import { AppContext } from '../../context/appContext';
import { getSensors, createSensor, deleteSensor } from '../../services/sensor';
import { getDevice } from '../../services/helix';
import styles from './styles';
import adjustDate from '../../helper/adjustDate';

export default function SensorScreen({ navigation }) {
  const [sensorId, setSensorId] = useState('');
  const [deleteSensorId, setDeleteSensorId] = useState('');
  const [createNewSensor, setCreateNewSensor] = useState(false);
  const [assureDeletion, setAssureDeletion] = useState(false);

  const { setLoading, tokenJwt, userId, sensors, setSensors } =
    useContext(AppContext);

  const getInfoSensor = async () => {
    try {
      const respData = await getSensors({ setLoading, userId, tokenJwt });

      setSensors([...respData]);
    } catch (error) {
      console.log('error', error);
      Alert.alert(
        'Erro!',
        'Falha ao buscar sensores, tente novamente mais tarde!'
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      getInfoSensor();
    }, [])
  );

  const questionDeleteSensor = id => {
    setAssureDeletion(true);
    setDeleteSensorId(id);
  };

  const confirmDelete = async () => {
    try {
      setAssureDeletion(false);
      await deleteSensor({ setLoading, tokenJwt, sensorId: deleteSensorId });
      setDeleteSensorId('');
      getInfoSensor();
    } catch (error) {
      Alert.alert(
        'Erro!',
        'Falha ao excluir sensor, tente novamente mais tarde!'
      );
    }
  };

  const cancelNewSensor = () => {
    setCreateNewSensor(false);
    setSensorId('');
  };

  const saveNewSensor = async () => {
    try {
      const respData = await getDevice({ setLoading, deviceId: sensorId });
      await createSensor({
        setLoading,
        tokenJwt,
        data: respData,
      });
      setSensorId('');
      getInfoSensor();
      cancelNewSensor();
    } catch (error) {
      Alert.alert(
        'Erro!',
        'Falha ao encontrar novo sensor, tente novamente mais tarde!'
      );
    }
  };

  return (
    <Provider>
      <ScrollView>
        <Portal>
          <Dialog
            visible={assureDeletion}
            onDismiss={() => {
              setAssureDeletion(false);
            }}
          >
            <Dialog.Title>Atenção!</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">Deseja realmente apagar?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => {
                  setAssureDeletion(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                onPress={() => {
                  confirmDelete();
                }}
              >
                Apagar
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        {!createNewSensor && (
          <View>
            <Button
              style={styles.createSensorButton}
              textColor="#fff"
              onPress={() => {
                setCreateNewSensor(true);
              }}
            >
              Adicionar Sensor
            </Button>
          </View>
        )}

        {createNewSensor && (
          <Card
            style={{ margin: 15, backgroundColor: 'white' }}
            theme={DefaultTheme}
          >
            <Card.Title
              title="Novo Sensor"
              titleStyle={{ fontSize: 20, color: '#000' }}
              theme={DefaultTheme}
            />
            <Card.Content theme={DefaultTheme}>
              <TextInput
                mode="outlined"
                label="ID do sensor:"
                onChangeText={text => setSensorId(text)}
                value={sensorId}
                theme={DefaultTheme}
              />
            </Card.Content>
            <Card.Actions>
              <Button
                textColor="#000"
                onPress={() => {
                  cancelNewSensor();
                }}
              >
                Cancelar
              </Button>
              <Button
                textColor="#fff"
                style={{ backgroundColor: '#008000' }}
                onPress={() => {
                  saveNewSensor();
                }}
              >
                Salvar
              </Button>
            </Card.Actions>
          </Card>
        )}
        {sensors && sensors.length ? (
          sensors.map((item, index) => (
            <Card style={{ margin: 15 }} key={item._id} theme={DefaultTheme}>
              <Card.Title
                theme={DefaultTheme}
                title={item.sensorHelixDeviceId}
                titleStyle={{ fontSize: 20, color: '#000' }}
              />
              <Button
                onPress={() => {
                  questionDeleteSensor(item._id);
                }}
                style={styles.positionButton}
              >
                <Icon name="trash" size={22} />
              </Button>
              <Card.Content theme={DefaultTheme}>
                <Text style={styles.txt}>ID: {item.sensorHelixEntityId}</Text>
                <Text style={styles.txt}>Atributo: {item.sensorHelixAttr}</Text>
                <Text style={styles.txt}>Valor atual: {item.currentVal}</Text>
                <Text style={styles.txt}>
                  Criado em: {adjustDate(item.createdAt)}
                </Text>
              </Card.Content>
              <Card.Actions theme={DefaultTheme}>
                <Button
                  onPress={() =>
                    navigation.navigate('SensorsInternScreen', {
                      title: item.sensorHelixDeviceId,
                    })
                  }
                  style={{ backgroundColor: '#008000' }}
                  textColor="#fff"
                >
                  Gráfico
                </Button>
              </Card.Actions>
            </Card>
          ))
        ) : (
          <Card
            style={{ margin: 30, backgroundColor: '#fff' }}
            theme={DefaultTheme}
          >
            <Card.Title
              theme={DefaultTheme}
              title="Nenhum sensor encontrado..."
              titleStyle={{ fontSize: 16, textAlign: 'center', color: '#000' }}
            />
          </Card>
        )}
      </ScrollView>
    </Provider>
  );
}

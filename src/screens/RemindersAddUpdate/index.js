import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import styles from '../RemindersAddUpdate/styles';
import {useDispatch, useSelector} from 'react-redux';
import {getLocation, getReminder, reminders} from '../../ducks/testPost';
import {ScreeNames} from '../../naviagtor';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../theme';
import PushNotification from 'react-native-push-notification';
import StatusBar from '../../components/StatusBar';
import CustomHeader from '../../components/Header/customHeader';
import {showMessage} from 'react-native-flash-message';

const Index = ({route}) => {
  // ================ useState =====================//
  const [name, setName] = useState('');
  const [radius, setRadius] = useState('');
  const [myLocationObj, setMyLocationObj] = useState('');
  const [isEditState, setIsEditState] = useState(false);
  // ================ useNavigation =====================//
  const navigation = useNavigation();
  // ================ useDispatch =====================//
  const dispatch = useDispatch();
  const getRemindersData = useSelector(getReminder);
  // ================ params =====================//
  const edit = route?.params?.edit;
  const text = route?.params?.text;
  const itemId = route?.params?.items?.id;
  const itemName = route?.params?.items?.name;
  const itemRadius = route?.params?.items?.radius;
  const isEdit = route?.params?.isEdit;
  const itemLocation = route?.params?.items?.location;
  const isConfirmLocation = route?.params?.item;
  const isConfirmAddress = isConfirmLocation?.location?.address;
  const isUpdateAddress = route?.params?.isUpdate;
  const isSelectAddress = route?.params?.isSelect;

  // ================ useEffect =====================//
  useEffect(() => {
    if (isEdit) {
      setIsEditState(true);
    }
  }, [isEdit]);
  useEffect(() => {
    console.log(
      'isSelectAddress:',
      isSelectAddress,
      'isUpdateAddress:',
      isUpdateAddress,
      'isEdit:',
      isEdit,
    );

    if (isSelectAddress || isUpdateAddress) {
      console.log(
        'Setting myLocationObj to isConfirmAddress:',
        isConfirmAddress,
      );
      setMyLocationObj(isConfirmAddress);
    } else if (isEdit) {
      console.log('Setting myLocationObj to itemLocation:', itemLocation);
      setName(itemName);
      setMyLocationObj(itemLocation);
      setRadius(itemRadius);
    }
  }, [isConfirmAddress, isSelectAddress, isUpdateAddress, isEdit]);
  //================== creating random ID =====================//
  const generateString = length => {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  };

  const handleNotification = myLocationObj => {
    PushNotification.localNotificationSchedule({
      channelId: 'test-channel',
      date: new Date(Date.now() + 5 * 1000),
      title: 'Reminder Added Successfully',
      message: myLocationObj,
      playSound: true,
      soundName: 'default',
      allowWhileIdle: true,
    });
  };

  const updatedData = () => {
    if (name === '' || myLocationObj === '' || radius === '') {
      showMessage({
        message: 'Fields cannot be empty',
        type: 'danger',
        duration: 2000,
        backgroundColor: Colors.teal,
      });
    } else {
      navigation.navigate(ScreeNames.Reminders);
      const updatedIndex = getRemindersData.findIndex(obj => obj.id === itemId);
      if (updatedIndex !== -1) {
        const updatedData = getRemindersData.map(obj => {
          if (obj.id === itemId) {
            console.log(
              myLocationObj,
              'myLocationObj ========================================',
            );
            return {
              id: generateString(8),
              name: name,
              radius: radius,
              location: myLocationObj,
              activate: false,
            };
          }
          return obj;
        });
        dispatch(reminders(updatedData));
        showUpdatedMessage();
      }
    }
  };

  const savedData = () => {
    if (name === '' || myLocationObj === '' || radius === '') {
      showMessage({
        message: 'Fields cannot be empty',
        type: 'danger',
        duration: 2000,
        backgroundColor: Colors.teal,
      });
    } else {
      navigation.navigate(ScreeNames.Reminders);
      const newData = {
        id: generateString(8),
        name: name,
        radius: radius,
        location: myLocationObj,
        activate: false,
      };
      const updatedData = [...getRemindersData, newData];
      dispatch(reminders(updatedData));
      handleNotification(myLocationObj);
      showSavedMessage();
    }
  };

  const showSavedMessage = () => {
    showMessage({
      message: 'Reminder has been saved successfully',
      type: 'success',
      duration: 2000,
      backgroundColor: Colors.teal,
    });
  };

  const showUpdatedMessage = () => {
    showMessage({
      message: 'Reminder has been updated successfully',
      type: 'success',
      duration: 2000,
      backgroundColor: Colors.teal,
    });
  };

  const handleNameChange = value => {
    setName(value);
  };

  const handleRadiusChange = value => {
    setRadius(value);
  };

  const isEditable = () => {
    isEdit
      ? navigation.navigate(ScreeNames.Locations, {isEdit: isEdit})
      : navigation.navigate(ScreeNames.Locations);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <CustomHeader
        text={text}
        edit={edit}
        isEdit={isEdit}
        isUpdateAddress={isUpdateAddress}
      />
      <View style={styles.textInputsView}>
        <TextInput
          style={styles.textInputStyle}
          onChangeText={handleNameChange}
          value={name}
          placeholder="Name"
          placeholderTextColor="gray"
          maxLength={30}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.locationFieldButton}
          onPress={() => isEditable()}>
          <Text
            style={[
              styles.locationTxt,
              {color: myLocationObj ? Colors.black : 'gray'},
            ]}>
            {myLocationObj
              ? myLocationObj.length > 30
                ? `${myLocationObj.slice(0, 30)}...`
                : myLocationObj
              : 'Location'}{' '}
          </Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInputStyle}
          onChangeText={handleRadiusChange}
          value={radius}
          placeholder="Radius"
          keyboardType="numeric"
          placeholderTextColor="gray"
          maxLength={3}
        />
      </View>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={() => {
            isEdit || edit || isUpdateAddress || isEditState
              ? updatedData()
              : savedData();
          }}>
          <Text style={styles.buttonTxt}>
            {isEdit || edit || isUpdateAddress || isEditState
              ? 'Update'
              : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Index;

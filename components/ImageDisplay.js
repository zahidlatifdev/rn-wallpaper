import React from "react"
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from "react-native"

import { createClient } from 'pexels';
import RNFetchBlob from 'rn-fetch-blob'
import Modal from 'react-native-modal';
import {PEXEL_API} from '../constants.js'

const client = createClient(PEXEL_API);
import Icon from 'react-native-vector-icons/AntDesign';
import { requestStoragePermission } from "../requestStoragePermission";

const Dev_Height = Dimensions.get('screen').height
const Dev_Width = Dimensions.get('screen').width

export default class ImageDisplay extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      id: this.props.route.params.id,
      image_uri: null,
      low_res_image_uri: null,
      isloading: true,
      Activity_Indicator: true,
      isDownloading: false,
      showSuccessModal: false,
    }
  }

  componentDidMount() {
    this.Findimage();
  }

  Findimage = async () => {
    try {
      this.setState({ isloading: true });
      const photo = await client.photos.show({ id: this.state.id });
      if (photo && photo.src) {
        this.setState({
          image_uri: photo.src.original,
          low_res_image_uri: photo.src.medium,
          isloading: false
        });
      } else {
        console.error('Invalid photo data:', photo);
        this.setState({ isloading: false });
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      this.setState({ isloading: false });
    }
  }

  downloadImage = async () => {
    try {
      const { image_uri } = this.state;
      if (!image_uri) return;

      this.setState({ isDownloading: true });

      if (Platform.OS === 'android') {
        const granted = await requestStoragePermission();
        if (!granted) {
          Alert.alert('Permission Denied!', 'You need to give storage permission to download the image');
          this.setState({ isDownloading: false });
          return;
        }
      }

      const date = new Date();
      const ext = this.getExtention(image_uri);
      const { config, fs } = RNFetchBlob;
      const PictureDir = fs.dirs.PictureDir;
      const fileName = `wallpaper_${Math.floor(date.getTime() + date.getSeconds() / 2)}.${ext[0]}`;
      const filePath = `${PictureDir}/${fileName}`;

      try {
        const response = await RNFetchBlob.config({
          fileCache: true,
          path: filePath,
        }).fetch('GET', image_uri);

        // Ensure the file exists
        const exists = await RNFetchBlob.fs.exists(filePath);
        if (!exists) {
          throw new Error('File not saved properly');
        }

        // Scan file to make it visible in gallery
        if (Platform.OS === 'android') {
          await RNFetchBlob.fs.scanFile([{
            path: filePath,
            mime: 'image/jpeg'
          }]);
        }

        this.setState({ showSuccessModal: true });
      } catch (downloadError) {
        throw new Error(`Download failed: ${downloadError.message}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download image');
    } finally {
      this.setState({ isDownloading: false });
    }
  };

  getExtention(filename) {
    return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) :
      undefined;
  }

  renderSuccessModal = () => (
    <Modal
      isVisible={this.state.showSuccessModal}
      onBackdropPress={() => this.setState({ showSuccessModal: false })}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.5}
      style={{ margin: 0, justifyContent: 'flex-end' }}>
      <View style={styles.modalContainer}>
        <View style={styles.successContent}>
          <Icon name="checkcircle" size={50} color="#2abb9b" />
          <Text style={styles.successText}>Download Complete!</Text>
          <Text style={styles.successSubText}>Image saved to gallery</Text>
          <TouchableOpacity
            style={styles.okButton}
            onPress={() => this.setState({ showSuccessModal: false })}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  render() {
    const { image_uri, low_res_image_uri, isloading, Activity_Indicator } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        {!isloading && image_uri ? (
          <ImageBackground
            source={{ uri: low_res_image_uri }}
            style={{ height: "100%", width: "100%" }}
            onLoadStart={() => this.setState({ Activity_Indicator: true })}
            onLoadEnd={() => this.setState({ Activity_Indicator: false })}
          >
            <Image
              source={{ uri: image_uri }}
              style={{ height: "100%", width: "100%", position: 'absolute' }}
              onLoadEnd={() => this.setState({ Activity_Indicator: false })}
            />
            <ActivityIndicator
              color="#FFF"
              size="large"
              style={{ position: "absolute", top: Dev_Height - (0.5 * Dev_Height), right: Dev_Width - (0.55 * Dev_Width) }}
              animating={this.state.Activity_Indicator} />
            <View style={styles.close_button_style}>
              <TouchableOpacity style={styles.Close_Button_Touchable} onPress={() => this.props.navigation.goBack()}>
                <Icon name="left" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={{ height: "70%", width: "100%", justifyContent: "flex-end", backgroundColor: "transparent", alignItems: "center" }}>
              <TouchableOpacity
                onPress={this.downloadImage}
                disabled={this.state.isDownloading}
                style={styles.downloadButton}>
                {this.state.isDownloading ? (
                  <ActivityIndicator color="#121212" size="small" />
                ) : (
                  <Text style={{ color: "#121212", fontSize: 16 }}>Download</Text>
                )}
              </TouchableOpacity>
            </View>
            {this.renderSuccessModal()}
          </ImageBackground>
        ) :
          (
            <View style={{ height: "100%", width: "100%" }}>
              <View style={styles.close_button_style}>
                <TouchableOpacity style={styles.Close_Button_Touchable} onPress={() => this.props.navigation.goBack()}>
                  <Icon name="left" size={18} color="#2abb9b" />
                </TouchableOpacity>
              </View>
              <View style={{ height: "50%", width: "100%", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator color="#2abb9b" size="large" />
              </View>
            </View>
          )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    height: Dev_Height,
    width: Dev_Width,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222222",
  },
  close_button_style: {
    height: '20%',
    width: '90%',
    justifyContent: "center",
    paddingTop: StatusBar.currentHeight
  },
  Close_Button_Touchable: {
    height: 50,
    width: 50,
    backgroundColor: 'rgba(225,225,225,0.1)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: "10%"
  },
  downloadButton: {
    height: "8%",
    width: "40%",
    borderRadius: 15,
    backgroundColor: "rgba(225,225,225,0.9)",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'row'
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  successContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
  },
  successSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  okButton: {
    backgroundColor: '#2abb9b',
    paddingHorizontal: 50,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  okButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

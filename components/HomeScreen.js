import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Image,
  FlatList,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Animated
} from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carousel from 'react-native-reanimated-carousel';
import { ScrollView } from 'react-native-gesture-handler';
import { mainCategories } from "../categories";
import { PEXEL_API } from '../constants.js'

const Dev_Height = Dimensions.get('screen').height
const Dev_Width = Dimensions.get('screen').width

import Icon from "react-native-vector-icons/AntDesign"

import { createClient } from 'pexels';
const client = createClient(PEXEL_API);

const ShimmerPlaceholder = () => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-350, 350]
  });

  return (
    <View style={{
      height: "100%",
      width: "100%",
      backgroundColor: '#2a2a2a',
      borderRadius: 15,
      overflow: 'hidden'
    }}>
      <Animated.View
        style={{
          width: "100%",
          height: "100%",
          position: 'absolute',
          backgroundColor: '#3a3a3a',
          transform: [{ translateX }],
          opacity: 0.5
        }}
      />
    </View>
  );
};

const CarouselItem = ({ item, navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={{
      padding: 10,  // Add padding around the carousel item
      width: "100%",
      height: "100%"
    }}>
      <TouchableOpacity
        style={{
          height: "100%",
          width: "100%",
          borderRadius: 15,
          overflow: 'hidden',
          backgroundColor: '#2a2a2a',
          elevation: 5, // Add shadow for Android
          shadowColor: '#000', // Add shadow for iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
        onPress={() => navigation.navigate("ImageDisplay", { "id": item?.id })}
      >
        {isLoading && <ShimmerPlaceholder />}
        {item?.src?.medium && (
          <Image
            source={{ uri: item.src.medium }}
            style={{
              height: "100%",
              width: "100%",
              borderRadius: 15
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError(true);
              setIsLoading(false);
            }}
          />
        )}
        {error && (
          <View style={{
            height: "100%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <Text style={{ color: "#fff" }}>Failed to load image</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const CategoryItem = ({ item, index, navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const storedImage = await AsyncStorage.getItem(`categoryImage_${item.title}`);
        if (storedImage) {
          setImageUri(storedImage);
          setIsLoading(false);
        } else {
          setImageUri(item.img_url);
          console.log(item.img_url)
          await AsyncStorage.setItem(`categoryImage_${item.title}`, item.img_url);
          setIsLoading(false);
        }
      } catch (error) {
        setError(true);
        setIsLoading(false);
      }
    };
    loadImage();
  }, [item.img_url, item.title]);

  return (
    <TouchableOpacity
      style={{
        height: "90%",
        width: Dev_Width - (0.6 * Dev_Width),
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#2a2a2a'
      }}
      onPress={() => navigation.navigate("FullCatogery", { "query": item.title })}
    >
      {isLoading && <ShimmerPlaceholder />}
      {imageUri && (
        <ImageBackground
          source={{ uri: imageUri }}
          style={{
            height: "100%",
            width: "100%",
            justifyContent: "flex-end"
          }}
          imageStyle={{ borderRadius: 15 }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
        >
          <View style={{
            padding: 15,
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15
          }}>
            <Text style={{
              color: "#FFF",
              fontWeight: "bold",
              fontSize: 18
            }}>
              {item.title}
            </Text>
          </View>
        </ImageBackground>
      )}
      {error && (
        <View style={{
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <Text style={{ color: "#fff" }}>Failed to load image</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default class HomeScreen extends React.Component {

  slide = () => {
    Animated.spring(this.state.x, {
      toValue: 0,
      useNativeDriver: "true",
      speed: 0.2
    }).start();
    this.setState({
      visible: true,
    });
  };

  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 1,
      carouselItems: [],
      selectedIndex: 1,
      searchQuery: "",
      visible: false,
      x: new Animated.Value(-100),
      mainCategories: [],
      backgroundImage: null,
    }
  }

  FindImages = () => {
    const queries = [
      "Landscapes", "Nature", "Abstract", "Space",
      "Architecture", "City", "Ocean", "Mountains"
    ];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    const randomPage = Math.floor(Math.random() * 10) + 1;

    client.photos.search({
      query: randomQuery,
      per_page: 10,
      page: randomPage
    }).then(photos => {
      if (photos && photos.photos) {
        this.setState({ carouselItems: photos.photos });
      }
    }).catch(error => {
      console.error('Error fetching images:', error);
    });
  }

  componentDidMount() {
    this.slide();
    this.loadData();
    this.FindImages(); // Add this line to load carousel images
  }

  loadData = async () => {
    try {
      const categories = await AsyncStorage.getItem('categories');
      const backgroundImage = await AsyncStorage.getItem('backgroundImage');

      if (categories && backgroundImage) {
        this.setState({
          mainCategories: JSON.parse(categories),
          backgroundImage: backgroundImage,
        });
      } else {
        this.saveData();
      }
    } catch (error) {
      console.error('Error loading data from AsyncStorage:', error);
    }
  }

  saveData = async () => {
    try {

      const backgroundImage = "https://cdn.dribbble.com/users/1325237/screenshots/12008929/media/fd36b900a9e355bfee1e8585f6052ed8.png";

      await AsyncStorage.setItem('categories', JSON.stringify(mainCategories));
      await AsyncStorage.setItem('backgroundImage', backgroundImage);

      this.setState({
        mainCategories: mainCategories,
        backgroundImage: backgroundImage,
      });
    } catch (error) {
      console.error('Error saving data to AsyncStorage:', error);
    }
  }

  _renderItemCatogories = ({ item, index }) => {
    return <CategoryItem item={item} index={index} navigation={this.props.navigation} />;
  }

  renderSeparator = () => (
    <View
      style={{
        width: 20,
      }}
    />
  );

  _renderItem = ({ item, index }) => {
    return <CarouselItem item={item} navigation={this.props.navigation} />;
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View>
            <ImageBackground
              source={{ uri: this.state.backgroundImage }}
              style={styles.MainBackground_View}
              imageStyle={{ height: "100%", width: "100%", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
              <View style={{ height: "100%", width: "100%", alignItems: "center", paddingTop: StatusBar.currentHeight }}>
                <Animated.View style={{
                  height: "45%", width: "100%", justifyContent: "center", alignItems: "center", marginTop: "5%",
                  transform: [{ translateX: this.state.x }]
                }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFF" }}> Check Out All The High   </Text>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFF" }}> Quality Wallpaper's  </Text>
                </Animated.View>
                <Animated.View style={{ ...styles.SearchBox_Main_Style, transform: [{ translateX: this.state.x }] }}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search For Free Wallpaper"
                    placeholderTextColor="#808080"
                    value={this.state.searchQuery}
                    onChangeText={(value) => this.setState({ searchQuery: value })}
                  />
                  <TouchableOpacity style={styles.searchButton}
                    onPress={() => this.props.navigation.navigate("FullCatogery", { "query": this.state.searchQuery })}>
                    <Icon name="search1" color="#FFF" size={20} />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </ImageBackground>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Pick's For You !</Text>
            </View>

            <View style={styles.carouselContainer}>
              <Carousel
                vertical={false}
                width={Dev_Width}
                height={Dev_Height * 0.2}
                style={{ width: Dev_Width }}
                autoPlay={true}
                data={this.state.carouselItems}
                defaultIndex={0}
                renderItem={this._renderItem}
                enabled={true}
                loop
                autoPlayInterval={3000}
              />
            </View>

            {/* Categories sections */}
            {this.state.mainCategories.map((category, index) => (
              <View key={index}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{category.title}</Text>
                </View>
                <View style={styles.categoriesContainer}>
                  <FlatList
                    style={styles.categoriesList}
                    data={category.subcategories}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={this._renderItemCatogories}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    ItemSeparatorComponent={this.renderSeparator}
                    alwaysBounceHorizontal={true}
                    bounces={true}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        {console.log(mainCategories[2].subcategories)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222222",
  },
  MainBackground_View: {
    height: Dev_Height * 0.3,
    width: "100%",
    justifyContent: "center",
  },
  sectionHeader: {
    paddingVertical: 15,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: "5%"
  },
  carouselContainer: {
    height: Dev_Height * 0.2,
  },
  categoriesContainer: {
    height: Dev_Height * 0.25,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesList: {
    height: "100%",
    width: "93%",
  },
  SearchBox_Main_Style: {
    marginTop: "5%",
    height: 50,
    width: "85%",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333333",
    borderRadius: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: '#444444',
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "#FFF",
    fontSize: 16,
    paddingRight: 10,
  },
  searchButton: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#444444',
    borderRadius: 10,
  }
})

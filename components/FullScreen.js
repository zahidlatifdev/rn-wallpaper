import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { createClient } from 'pexels';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { PEXEL_API } from '../constants.js'

const client = createClient(PEXEL_API);
const { width } = Dimensions.get('window');

const FullScreen = ({ route, navigation }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { query } = route.params;

  const fetchImages = async (pageNumber) => {
    console.log('fetchImages');
    try {
      const response = await client.photos.search({
        query,
        per_page: 30,
        page: pageNumber,
        orientation: 'portrait',
        size: 'medium',
        sort: Math.random() > 0.5 ? 'popular' : 'latest'
      });

      if (response.photos.length === 0) {
        setHasMore(false);
        return;
      }

      const shuffledPhotos = response.photos
        .sort(() => Math.random() - 0.5);

      if (pageNumber === 1) {
        setImages(shuffledPhotos);
      } else {
        setImages(prev => [...prev, ...shuffledPhotos]);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    console.log('loadMore');
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
      fetchImages(page + 1);
    }
  }, [isLoadingMore, hasMore, page]);

  useEffect(() => {
    fetchImages(1);
  }, []);

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ImageDisplay', { id: item.id })}
      activeOpacity={0.7}
      style={styles.imageContainer}
    >
      <Image
        source={{ uri: item.src.tiny }}
        style={styles.image}
        resizeMode="cover"
        onLoad={() => {
          // Preload the medium resolution image
          Image.prefetch(item.src.medium);
        }}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="left" size={24} color="#FFF" />
      </TouchableOpacity>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  flatListContent: {
    padding: 8,
  },
  imageContainer: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 0.6,
    borderRadius: 12,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FullScreen;
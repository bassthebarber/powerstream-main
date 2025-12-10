/**
 * TV Screen (PowerStream TV)
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tvApi, Station, LiveStream, VODAsset } from '../api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

// Station card component
const StationCard: React.FC<{ station: Station; onPress: () => void }> = ({
  station,
  onPress,
}) => (
  <TouchableOpacity style={styles.stationCard} onPress={onPress}>
    <View style={styles.stationBanner}>
      {station.bannerUrl ? (
        <Image source={{ uri: station.bannerUrl }} style={styles.stationBannerImage} />
      ) : (
        <View style={styles.stationBannerPlaceholder}>
          <Text style={styles.stationBannerPlaceholderText}>📺</Text>
        </View>
      )}
      {station.isLive && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      )}
    </View>
    <View style={styles.stationInfo}>
      <Text style={styles.stationName} numberOfLines={1}>
        {station.name}
      </Text>
      {station.isLive && (
        <Text style={styles.stationViewers}>
          {station.viewerCount.toLocaleString()} watching
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

// Live stream card
const LiveStreamCard: React.FC<{ stream: LiveStream; onPress: () => void }> = ({
  stream,
  onPress,
}) => (
  <TouchableOpacity style={styles.liveCard} onPress={onPress}>
    <View style={styles.liveThumbnail}>
      {stream.thumbnailUrl ? (
        <Image source={{ uri: stream.thumbnailUrl }} style={styles.liveThumbnailImage} />
      ) : (
        <View style={styles.liveThumbnailPlaceholder}>
          <Text style={styles.liveThumbnailPlaceholderText}>🔴</Text>
        </View>
      )}
      <View style={styles.liveIndicator}>
        <View style={styles.liveIndicatorDot} />
        <Text style={styles.liveIndicatorText}>LIVE</Text>
      </View>
      <View style={styles.viewerCount}>
        <Text style={styles.viewerCountText}>
          👁️ {stream.viewerCount.toLocaleString()}
        </Text>
      </View>
    </View>
    <Text style={styles.liveTitle} numberOfLines={2}>
      {stream.title}
    </Text>
    <Text style={styles.liveStation}>{stream.stationName}</Text>
  </TouchableOpacity>
);

// VOD card
const VODCard: React.FC<{ asset: VODAsset; onPress: () => void }> = ({
  asset,
  onPress,
}) => (
  <TouchableOpacity style={styles.vodCard} onPress={onPress}>
    <View style={styles.vodThumbnail}>
      {asset.thumbnailUrl ? (
        <Image source={{ uri: asset.thumbnailUrl }} style={styles.vodThumbnailImage} />
      ) : (
        <View style={styles.vodThumbnailPlaceholder}>
          <Text style={styles.vodThumbnailPlaceholderText}>🎬</Text>
        </View>
      )}
      <View style={styles.vodDuration}>
        <Text style={styles.vodDurationText}>
          {Math.floor(asset.duration / 60)}:{(asset.duration % 60).toString().padStart(2, '0')}
        </Text>
      </View>
    </View>
    <Text style={styles.vodTitle} numberOfLines={2}>
      {asset.title}
    </Text>
    <Text style={styles.vodViews}>{asset.views.toLocaleString()} views</Text>
  </TouchableOpacity>
);

const TVScreen: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [trendingVOD, setTrendingVOD] = useState<VODAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stationsData, liveData, vodData] = await Promise.all([
        tvApi.getFeaturedStations(),
        tvApi.getLiveStreams(),
        tvApi.getTrendingVOD(),
      ]);
      setStations(stationsData);
      setLiveStreams(liveData);
      setTrendingVOD(vodData);
    } catch (error) {
      console.error('Failed to fetch TV data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStationPress = (station: Station) => {
    console.log('Open station:', station.slug);
  };

  const handleLiveStreamPress = (stream: LiveStream) => {
    console.log('Open live stream:', stream.id);
  };

  const handleVODPress = (asset: VODAsset) => {
    console.log('Open VOD:', asset.id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ PowerStream TV</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchData}
            tintColor="#ffb84d"
          />
        }
      >
        {/* Live Now Section */}
        {liveStreams.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔴 Live Now</Text>
            <FlatList
              horizontal
              data={liveStreams}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <LiveStreamCard stream={item} onPress={() => handleLiveStreamPress(item)} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Featured Stations */}
        {stations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Featured Stations</Text>
            <FlatList
              horizontal
              data={stations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <StationCard station={item} onPress={() => handleStationPress(item)} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Trending VOD */}
        {trendingVOD.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Trending</Text>
            <FlatList
              horizontal
              data={trendingVOD}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <VODCard asset={item} onPress={() => handleVODPress(item)} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffb84d',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  // Station card
  stationCard: {
    width: CARD_WIDTH,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  stationBanner: {
    width: '100%',
    height: 120,
    backgroundColor: '#333',
  },
  stationBannerImage: {
    width: '100%',
    height: '100%',
  },
  stationBannerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationBannerPlaceholderText: {
    fontSize: 48,
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  stationInfo: {
    padding: 12,
  },
  stationName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stationViewers: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  // Live stream card
  liveCard: {
    width: 200,
    marginRight: 12,
  },
  liveThumbnail: {
    width: '100%',
    height: 112,
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  liveThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  liveThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveThumbnailPlaceholderText: {
    fontSize: 32,
  },
  liveIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewerCount: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewerCountText: {
    color: '#fff',
    fontSize: 10,
  },
  liveTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  liveStation: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  // VOD card
  vodCard: {
    width: 160,
    marginRight: 12,
  },
  vodThumbnail: {
    width: '100%',
    height: 90,
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  vodThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  vodThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vodThumbnailPlaceholderText: {
    fontSize: 24,
  },
  vodDuration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  vodDurationText: {
    color: '#fff',
    fontSize: 10,
  },
  vodTitle: {
    color: '#fff',
    fontSize: 13,
    marginTop: 6,
  },
  vodViews: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
});

export default TVScreen;




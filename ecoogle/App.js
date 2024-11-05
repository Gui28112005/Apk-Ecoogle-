import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, StyleSheet, FlatList, Modal, ScrollView, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

import localImage from './assets/logoNova2.jpg'; // Ajuste o caminho conforme necessário

const Drawer = createDrawerNavigator();
const BING_API_KEY = 'afebc8f8c45d4ed9a058b73ac3871a6d';

const HomeScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
      if (query.trim()) {
          navigation.navigate('Buscar', { query });
      }
  };

  return (
      <ScrollView contentContainerStyle={styles.container1}>
          <View style={styles.centeredContainer}>
              <Image source={localImage} style={styles.logoImage} />
              <View style={styles.inputContainer}>
                  <TextInput
                      style={styles.input}
                      placeholder="Digite sua pesquisa"
                      placeholderTextColor="#aaa"
                      value={query}
                      onChangeText={setQuery}
                  />
                  <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
                      <Icon name="search" size={24} color="black" />
                  </TouchableOpacity>
              </View>

              <Svg viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.svg}>
                  <Defs>
                      <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <Stop offset="0%" stopColor="#9bf074" stopOpacity={1} />
                          <Stop offset="100%" stopColor="#5b9641" stopOpacity={1} />
                      </LinearGradient>
                  </Defs>
                  <Path fill="url(#gradient)" d="M0,2 Q45,20 110,0 L100,20 L0,20 Z" />
              </Svg>

              <Image
                  source={require('./assets/backgroud.jpg')}
                  style={styles.fullScreenImage}
              />
              <Text style={styles.overlayText}>Plante sua Busca!</Text>
              
              {/* Menu na parte inferior da rolagem */}
              <BottomMenu navigation={navigation} />
          </View>
      </ScrollView>
  );
};

const BottomMenu = ({ navigation }) => (
  <View style={styles.bottomMenu}>
    <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.menuButton}>
      <Icon name="home" size={24} color="#007BFF" />
      <Text style={styles.menuButtonText}>Home</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')} style={styles.menuButton}>
      <Icon name="document-text" size={24} color="#007BFF" />
      <Text style={styles.menuButtonText}>Política</Text>
    </TouchableOpacity>
  </View>
);

const BuscarScreen = ({ route, navigation }) => {
  const { query: initialQuery } = route.params;
  const [query, setQuery] = useState(initialQuery);
  const [webResults, setWebResults] = useState([]);
  const [images, setImages] = useState([]);
  const [newsResults, setNewsResults] = useState([]);
  const [videoResults, setVideoResults] = useState([]);
  const [adResults, setAdResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);


  useEffect(() => {
      // Chama a busca quando a query é alterada
      if (query) {
          fetchData();
      }
  }, [query]); // Reage a mudanças na query


  const fetchAds = async () => {
      try {
          const adResponse = await fetch(`https://backendeco.azurewebsites.net/ads?keyword=${encodeURIComponent(query)}`);
          const adData = await adResponse.json();
          setAdResults(adData || []);
      } catch (error) {
          console.error('Error fetching ads:', error);
      }
  };


  const fetchData = async () => {
      try {
          const responses = await Promise.all([
              fetch(`https://api.bing.microsoft.com/v7.0/search?q=${query}`, {
                  headers: { 'Ocp-Apim-Subscription-Key': BING_API_KEY },
              }),
              fetch(`https://api.bing.microsoft.com/v7.0/images/search?q=${query}`, {
                headers: { 'Ocp-Apim-Subscription-Key': BING_API_KEY },
            }),
              fetch(`https://api.bing.microsoft.com/v7.0/news/search?q=${query}`, {
                  headers: { 'Ocp-Apim-Subscription-Key': BING_API_KEY },
              }),
              fetch(`https://api.bing.microsoft.com/v7.0/videos/search?q=${query}`, {
                  headers: { 'Ocp-Apim-Subscription-Key': BING_API_KEY },
              }),
          ]);


          const imagesData = await responses[1].json();
          const webData = await responses[0].json();
          const newsData = await responses[2].json();
          const videoData = await responses[3].json();


          setImages(imagesData.value || []);
          setWebResults(webData.webPages?.value || []);
          setNewsResults(newsData.value || []);
          setVideoResults(videoData.value || []);
          fetchAds(); // Fetch ads
      } catch (error) {
          console.error(error.message);
      }
  };


  const handleSearch = () => {
      if (query.trim()) {
          fetchData(); // Atualiza os dados com a nova consulta
      }
  };


  const renderContent = () => {
    switch (activeIndex) {
        
      case 0:
        const combinedWebResults = [...adResults, ...webResults]; // Anúncios primeiro
        return (
            <FlatList
                data={combinedWebResults}
                keyExtractor={(item) => item.url || item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                      onPress={() => Linking.openURL(item.url)}
                      style={styles.resultContainer}
                  >
                      {adResults.some(ad => ad.url === item.url) && (
                          <View style={styles.patrocinadoContainer}>
                              <Text style={styles.patrocinadoText}>Patrocinado</Text>
                          </View>
                      )}
                      <Text style={styles.resultTitle}>{item.name || item.titulo}</Text>
                      <Text>{item.snippet || item.descricao}</Text>
                  </TouchableOpacity>
              )}
            />
        );
      case 1:
            return (
                <FlatList
                    data={images}
                    keyExtractor={(item) => item.contentUrl}
                    renderItem={({ item }) => (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: item.contentUrl }} style={styles.image} />
                            <Text style={styles.resultTitle}>{item.name}</Text>
                        </View>
                    )}
                    numColumns={2}
                    contentContainerStyle={styles.imageList}
                />
            );

          case 2:
              return (
                  <FlatList
                      data={newsResults}
                      keyExtractor={(item) => item.url}
                      renderItem={({ item }) => (
                          <View style={styles.resultContainer}>
                              <Text style={styles.resultTitle}>{item.name}</Text>
                              {/* A URL não será exibida */}
                              <Text>{item.description}</Text>
                          </View>
                      )}
                  />
              );
              case 3:
                return (
                    <FlatList
                        data={videoResults}
                        keyExtractor={(item) => item.contentUrl}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => Linking.openURL(item.contentUrl)} // Adicionando o link para abrir o vídeo
                                style={styles.resultContainer}
                            >
                                <Text style={styles.resultTitle}>{item.name}</Text>
                                <Text>{item.description}</Text>
                            </TouchableOpacity>
                        )}
                    />
                );
          default:
              return null;
      }
  };


  return (
      <View style={styles.container1}>
          <Image source={localImage} style={styles.resultImage} />
          <View style={styles.inputContainer}>
              <TextInput
                  style={styles.input}
                  placeholder="Digite sua pesquisa"
                  placeholderTextColor="#aaa"
                  value={query}
                  onChangeText={setQuery}
              />
              <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
                  <Icon name="search" size={24} color="black" />
              </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
              {['Web','Imagens', 'News', 'Vídeos'].map((label, index) => (
                  <TouchableOpacity
                      key={label}
                      onPress={() => setActiveIndex(index)}
                      style={[
                          styles.toggleButton,
                          activeIndex === index ? styles.activeButton : styles.inactiveButton
                      ]}
                  >
                      <Text style={styles.toggleButtonText}>{label}</Text>
                  </TouchableOpacity>
              ))}
          </View>


          <FlatList
              data={[renderContent()]} // Necessário para o FlatList renderizar algo
              renderItem={({ item }) => item}
              keyExtractor={() => String(activeIndex)}
          />


         
      </View>
  );
};


const PolíticadePrivacidadeScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Política de Privacidade</Text>
        
        <View style={styles.section}>
            <Text style={styles.sectionHeader}>Introdução</Text>
            <Text style={styles.sectionText}>
                Esta é a política de privacidade do aplicativo. Aqui você pode ler sobre como
                suas informações são tratadas.
            </Text>
        </View>
        
        <View style={styles.section}>
            <Text style={styles.sectionHeader}>Coleta de Informações</Text>
            <Text style={styles.sectionText}>
                Coletamos informações para fornecer melhores serviços aos nossos usuários. 
                Isso inclui dados pessoais e informações sobre o uso do aplicativo.
            </Text>
        </View>
        
        <View style={styles.section}>
            <Text style={styles.sectionHeader}>Uso das Informações</Text>
            <Text style={styles.sectionText}>
                As informações coletadas são utilizadas para melhorar a experiência do usuário e 
                oferecer conteúdo personalizado.
            </Text>
        </View>
        
        <View style={styles.section}>
            <Text style={styles.sectionHeader}>Compartilhamento de Informações</Text>
            <Text style={styles.sectionText}>
                Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário 
                para cumprir a lei ou proteger nossos direitos.
            </Text>
        </View>
        <View style={styles.section}>
            <Text style={styles.sectionHeader}>Compartilhamento de Informações</Text>
            <Text style={styles.sectionText}>
                Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário 
                para cumprir a lei ou proteger nossos direitos.
            </Text>
        </View>        
        <TouchableOpacity onPress={() => Linking.openURL('https://example.com/privacy')}>
            <Text style={styles.link}>
                Leia mais sobre nossa política de privacidade aqui.
            </Text>
        </TouchableOpacity>
    </ScrollView>
);
};

const App = () => {
  const [modalVisible, setModalVisible] = useState(true);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
      const checkAgreement = async () => {
          const hasAgreed = await AsyncStorage.getItem('termsAgreed');
          if (hasAgreed) {
              setAgreed(true);
              setModalVisible(false);
          }
      };
      checkAgreement();
  }, []);

  const handleAgree = async () => {
      await AsyncStorage.setItem('termsAgreed', 'true');
      setAgreed(true);
      setModalVisible(false);
  };

  return (
      <NavigationContainer>
          <Drawer.Navigator initialRouteName="Home">
              <Drawer.Screen 
                  name="Home" 
                  component={HomeScreen} 
              />
              <Drawer.Screen 
                  name="Buscar" 
                  component={BuscarScreen} 
                 
              />
              <Drawer.Screen 
                  name="Política de Privacidade" 
                  component={PolíticadePrivacidadeScreen} 
              />
          </Drawer.Navigator>

          <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible && !agreed}
              onRequestClose={() => setModalVisible(false)}
          >
              <View style={styles.modalView}>
                  <Text style={styles.modalText}>
                      Você aceita os termos de uso do aplicativo?
                  </Text>
                  <TouchableOpacity
                      style={styles.button}
                      onPress={handleAgree}
                  >
                      <Text style={styles.buttonText}>Aceitar</Text>
                  </TouchableOpacity>
              </View>
          </Modal>
      </NavigationContainer>
  );
};


const styles = StyleSheet.create({
  container1: {
    flexGrow: 1,
    padding: 0,
    backgroundColor: '#ffffff',
},
centeredContainer: {
    alignItems: 'center',
    paddingBottom: 20, // Adicione um padding inferior se necessário
},
logoImage: {
    width: '100%',
    height: 120,
    marginTop:30,
    marginBottom: 8,
    borderRadius: 10,
    resizeMode: 'contain',
},

    resultImage: {
        width: '100%',
        height: 150,
        marginBottom: 20,
        borderRadius: 10,
        resizeMode: 'contain',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 26,
        width:400,
        marginHorizontal:10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        paddingRight: 40,
        borderRadius: 25,
        color: '#000',
        height: 45,
    },
    iconButton: {
        position: 'absolute',
        right: 10,
        top: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginBottom: 30,
        borderRadius:20,
    },
    toggleButton:{
        flex: 1,
        padding: 7,
        alignItems: 'center',
        borderRadius: 30,
        marginHorizontal: 10,
        borderWidth: 1,
    },
    activeButton: {
        backgroundColor: 'black',
        borderColor: '#0056b3',
    },
    inactiveButton: {
        backgroundColor: 'green',
        borderColor: 'gray',
    },
    toggleButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    resultContainer: {
      marginBottom: 15,
      padding: 15,
      backgroundColor: '#fff',
      borderRadius: 25,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      elevation: 2,
      width:410,
      left:10,
      borderWidth: 1, // Adicionando borda
      borderColor: '#ccc', // Cor da borda
  },
 
    imageContainer: {
        margin: 5,
        borderRadius: 5,
        overflow: 'hidden',
        width: '48%', // Alterando para duas colunas
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 150, // Ajustando altura para melhorar o design
        borderRadius: 5,
    },
    imageList: {
        paddingBottom: 10,
    },
    resultTitle: {
        marginTop: 5,
        fontWeight: 'bold',
    },
    resultUrl: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalText: {
        marginBottom: 20,
        color: '#fff',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    privacyText: {
        marginBottom: 20,
        textAlign: 'center',
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
    privacyButton: {
        marginTop: 'auto', // Posiciona o botão na parte inferior
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
        alignSelf: 'center', // Centraliza o botão horizontalmente
    },
    privacyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    patrocinadoContainer: {
      backgroundColor: '#ffeb3b', // Cor de fundo do contêiner
      borderRadius:18,            // Bordas arredondadas
      padding: 5,                 // Espaçamento interno
      marginBottom: 5,            // Espaçamento abaixo do contêiner
      alignSelf: 'flex-start',     // Alinhar à esquerda
      borderWidth: 1, // Adicionando borda
      borderColor: 'black', // Cor da borda
  },
  patrocinadoText: {
      color: '#000',              // Cor do texto
      fontWeight: 'bold',
  },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    borderRadius: 30, // Bordas arredondadas
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  menuButton: {
    flex: 1,
    alignItems: 'center',
  
  },
  menuButtonText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
fullScreenImage: {
  position: 'absolute',
  bottom: 1,
  left: 0,
  right: 0,
  width:'100%',
  height: '60%', // Ajuste a altura conforme necessário
  resizeMode: 'cover', // Para cobrir o espaço sem distorcer
},
clickCountContainer: {
  marginTop: 20,
  alignItems: 'center',
},


clickCountText: {
  fontSize: 18,
  color: '#333',
  fontWeight: 'bold',
},


treeMessageContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 10,
},
overlayText: {
  position: 'absolute',
  top: 620, // ajuste conforme necessário
  left: 90, // ajuste conforme necessário
  color: 'white', // cor do texto
  fontSize: 30, // tamanho da fonte
  fontWeight: 'bold', // peso da fonte
},

treeMessage: {
  fontSize: 16,
  color: 'green',
  marginLeft: 5,
},
container: {
  flexGrow: 1,
  padding: 20,
  backgroundColor: '#f9f9f9',
},
header: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 20,
  textAlign: 'center',
},
section: {
  marginBottom: 20,
  padding: 15,
  backgroundColor: '#fff',
  borderRadius: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 1.5,
  elevation: 2,
},
sectionHeader: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#007BFF',
  marginBottom: 10,
},
sectionText: {
  fontSize: 16,
  color: '#555',
  lineHeight: 24,
},
link: {
  color: '#007BFF',
  fontSize: 16,
  textDecorationLine: 'underline',
  textAlign: 'center',
  marginTop: 10,
},

});


export default App;


import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { FontAwesome5 } from '@expo/vector-icons'; // Importing FontAwesome5 for icons
import { APP_NAME} from "../../constants";

const About = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
   
        <Text style={styles.headerTitle}>
          Your Travel, Your Way, it's <Text style={styles.highlight}>{ APP_NAME}!!</Text>
        </Text>

        <View style={styles.header}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        
        <Text style={styles.nameApp}>{ APP_NAME}</Text>

        <Text style={styles.subtitle}>Founded by</Text>
        <Image source={require('../../assets/images/group.jpg')} style={styles.avatar} />
        <Text style={styles.teamName}>Group 1</Text>
        <Text style={styles.teamRole}>CCS IT-3 Students</Text>
      

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>{ APP_NAME}:</Text>
        <Text style={styles.aboutText}>
          
Say goodbye to stress and confusion with { APP_NAME}, your perfect guide for hassle-free commuting. Whether you're a daily commuter or a visitor, { APP_NAME} provides route suggestions and detailed maps to help you navigate the metro with ease. With the quickest, most efficient paths, you’ll enjoy smooth, stress-free travel. Experience a faster, smarter commute { APP_NAME} makes every journey simple, efficient, and enjoyable!
        </Text>
      </View>
      </View>

      {/* Team Section */}
      <View style={styles.teamSection}>
        <Text style={styles.teamTitle}>Meet Our Talented Team</Text>
        <View style={styles.teamGrid}>
          <View style={styles.teamMember}>
            <Image
              style={styles.memberAvatar}
              source={require('../../assets/images/abellana.jpg')}// Replace with actual image URL
              resizeMode="cover"
            />
            <Text style={styles.memberName}>Johana Eunice Abellana</Text>
            <Text style={styles.memberRole}>Project Manager {"\n"} Head Researcher</Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              style={styles.memberAvatar}
              source={require('../../assets/images/aldave.jpg')} // Replace with actual image URL
              resizeMode="cover"
            />
            <Text style={styles.memberName}>Joanah Marie L. Aldave</Text>
            <Text style={styles.memberRole}>Assistant Project Manager {"\n"} UI/UX Designer {"\n"} Head Researcher</Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              style={styles.memberAvatar}
              source={require('../../assets/images/logo.png')}// Replace with actual image URL
              resizeMode="cover"
            />
            <Text style={styles.memberName}>Gabriel Q. Bruzula</Text>
            <Text style={styles.memberRole}>Programmer</Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              style={styles.memberAvatar}
              source={require('../../assets/images/boyboy.jpg')}// Replace with actual image URL
              resizeMode="cover"
            />
            <Text style={styles.memberName}>Gerson A. Boyboy</Text>
            <Text style={styles.memberRole}>UI/UX Designer {"\n"}  Researcher</Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              style={styles.memberAvatar}
              source={require('../../assets/images/deguzman.jpg')}// Replace with actual image URL
              resizeMode="cover"
            />
            <Text style={styles.memberName}>Marc Jerald B. De Guzman</Text>
            <Text style={styles.memberRole}>Researcher</Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              style={styles.memberAvatar}
              source={require('../../assets/images/dumlao.jpg')}// Replace with actual image URL
              resizeMode="cover"
            />
            <Text style={styles.memberName}>Sean Zidane L. Dumlao</Text>
            <Text style={styles.memberRole}>Main Programmer </Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              style={styles.memberAvatar}
              source={require('../../assets/images/llanillo.jpg')}// Replace with actual image URL
              resizeMode="cover"
            />
            <Text style={styles.memberName}>Icko Cristian M. Llanillo</Text>
            <Text style={styles.memberRole}>Researcher</Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              style={styles.memberAvatar}
              source={require('../../assets/images/romillo.jpg')}// Replace with actual image URL
              resizeMode="cover"
            />
            <Text style={styles.memberName}>Patricia Mae R. Romillo</Text>
            <Text style={styles.memberRole}>UI/UX Designer {"\n"}  Researcher</Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              style={styles.memberAvatar}
              source={require('../../assets/images/ruaza.jpg')} // Replace with actual image URL
              resizeMode="cover"
            />
            <Text style={styles.memberName}>Ashley A. Ruaza</Text>
            <Text style={styles.memberRole}>Programmer</Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              style={styles.memberAvatar}
              source={require('../../assets/images/saavedra.jpg')} // Replace with actual image URL
              resizeMode="cover"
            />
            <Text style={styles.memberName}>John Paul J. Saavedra</Text>
            <Text style={styles.memberRole}>Programmer</Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              style={styles.memberAvatar}
              source={require('../../assets/images/salinas.jpg')}  // Replace with actual image URL
              resizeMode="cover"
            />
            <Text style={styles.memberName}>John Cedric G. Salinas</Text>
            <Text style={styles.memberRole}>Programmer</Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              style={styles.memberAvatar}
              source={require('../../assets/images/valeza.jpg')} // Replace with actual image URL
              resizeMode="cover"
            />
            <Text style={styles.memberName}>Joshua Emmanuel P. Valeza</Text>
            <Text style={styles.memberRole}>Programmer</Text>
          </View>
        </View>
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <View style={styles.footerGrid}>
          <View style={styles.footerItem}>
            <FontAwesome5 name="lightbulb" style={styles.footerIcon} />
            <Text style={styles.footerTitle}>Attraction Insights & Fun Facts</Text>
            <Text style={styles.footerDescription}>
              Offers descriptions, user feedback, and trivia to enhance appreciation and curiosity about each destination.
            </Text>
          </View>
          <View style={styles.footerItem}>
            <FontAwesome5 name="comments" style={styles.footerIcon} />
            <Text style={styles.footerTitle}>Social Integration</Text>
            <Text style={styles.footerDescription}>
              Allows users to share their travel experiences and reviews within the app.
            </Text>
          </View>
          <View style={styles.footerItem}>
            <FontAwesome5 name="map-marker-alt" style={styles.footerIcon} />
            <Text style={styles.footerTitle}>Cost-Effective Route Suggestions</Text>
            <Text style={styles.footerDescription}>
              Suggests the most economical routes using public transportation or walking paths.
            </Text>
          </View>
        </View>

        <View style={styles.footerBottom}>
          <View style={styles.footerBrand}>
            <Image source={require('../../assets/images/logo.png')} style={styles.brandIcon} />
            <View>
              <Text style={styles.brandTitle}>{ APP_NAME}</Text>
              <Text style={styles.brandDescription}>
                Conquer the Metro with ease! <Text style={{fontWeight: 900}}>{ APP_NAME}</Text>. Your companion for hassle-free commuting, offering clear routes, and navigation to make every journey stress-free.
              </Text>
            </View>
          </View>
          <Text style={styles.footerCopyright}>
            2024 © { APP_NAME}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
 
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 18,
    width: '90%',
    alignSelf: 'center',
    marginTop: 40
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: "#6366F1",
    borderRadius: 40,
    marginBottom: 5,
  },
  logo:{
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: 'center',
    zIndex: 1000,
  },
  headerTitle: {
    marginTop: 30,
    fontSize: 35,
    fontWeight: "bold",
    color: "#4A5568",
    textAlign: 'center',
    flexWrap: 'wrap'
  },
  highlight: {
    color: "#6A5AE0",
  },
  nameApp:{
  fontSize: 25,
  fontWeight:'500',
  color:'#424368',
  },
  subtitle: {
    marginTop: 20,
    marginBottom:5,
    fontSize: 14,
    color: "#A0AEC0",
  },
  teamName: {
    fontSize: 18,
    fontWeight: "400",
    color: "#4A5568",
    marginTop: 5,
  },
  teamRole: {
    fontSize: 14,
    color: "#A0AEC0",
  },
  aboutSection: {
    padding: 20,
    textAlign: "center",
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 15,
    textAlign:"center",
    marginTop: 20
  },
  aboutText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 24,
    textAlign: "center",
    flexWrap: 'wrap'
  },
  teamSection: {
    paddingVertical: 30,
    backgroundColor: "#F9FAFB",
    marginTop: 20
  },
  teamTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A5568",
    textAlign: "center",
    marginBottom: 30,
  },
  teamGrid: {
    flexDirection: "column",
    alignItems: "center",
  },
  teamMember: {
    alignItems: "center",
    marginBottom: 20,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 40,
    marginBottom: 10,
    overflow: 'hidden', 
  },
  memberName: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4A5568",
  },
  memberRole: {
    fontSize: 12,
    color: "#A0AEC0",
    textAlign: "center",
    marginBottom: 15
  },
  footer: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 40,
  },
  footerGrid: {
    flexDirection: "column",
    paddingHorizontal: 30,
    alignItems: "flex-start",
    width: "100%",
  },
  footerItem: {
    alignItems: "flex-start",
    marginBottom: 20,
    width: "100%",
  },
  footerIcon: {
    fontSize: 30,
    color: "#6366F1",
    marginBottom: 10,
  },
  footerTitle: {
    fontWeight: "700",
    color: "#4A5568",
    fontSize: 16,
    textAlign: "left",
  },
  footerDescription: {
    fontSize: 12,
    color: "#404163",
    textAlign: "left",
    marginBottom: 20
  },
  footerBottom: {
    marginTop: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    alignItems: "center",
  },
  footerBrand: {
    flexDirection: "column",
    alignItems: "center",
  },
  brandIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    marginTop: 20
  },
  brandTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#4A5568",
    textAlign: "center",
    marginTop:10
  },
  brandDescription: {
    fontSize: 12,
    color: "#04163",
    textAlign: "center",
    lineHeight: 16,
    marginTop: 10,
    flexWrap: 'wrap'
  },
  
  footerCopyright: {
    fontSize: 12,
    color: "#00000",
    textAlign: "center",
    marginTop:20,
    marginBottom:100,
    fontWeight:"500"
  },
});

export default About;
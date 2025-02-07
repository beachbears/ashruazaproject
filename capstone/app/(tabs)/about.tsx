import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { FontAwesome5 } from '@expo/vector-icons'; // Importing FontAwesome5 for icons

const About = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Your Travel, Your Way, it's <Text style={styles.highlight}>Kommutsera!!</Text>
        </Text>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.nameApp}>Kommutsera</Text>

        <Text style={styles.subtitle}>Founded by</Text>
        <Image source={require('../../assets/images/group.jpg')} style={styles.avatar} />
        <Text style={styles.teamName}>Group Name</Text>
        <Text style={styles.teamRole}>CCS IT-3 Students</Text>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>Kommutsera</Text>
        <Text style={styles.aboutText}>
          Say goodbye to stress and confusion with Kommutsera, your go-to tool for hassle-free commuting.
          Whether you're a daily commuter or an occasional traveler, Kommutsera simplifies your journey by offering
          curated routes, reliable schedules, and real-time updates. Navigate with ease and confidence and make every trip enjoyable.
          Experience a metro system that revolves around YOU.
        </Text>
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
              source={require('../../assets/images/aldave.jpg')}// Replace with actual image URL
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
            <Text style={styles.memberRole}>UI/UX Designer / Researcher</Text>
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
            <Text style={styles.memberRole}>Programmer</Text>
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
            <Text style={styles.memberRole}>UI/UX Designer / Researcher</Text>
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
              <Text style={styles.brandTitle}>Kommutsera</Text>
              <Text style={styles.brandDescription}>
                Conquer the Metro with ease! Kommutsera: Your companion for hassle-free commuting, offering clear routes, and navigation to make every journey stress-free.
              </Text>
            </View>
          </View>
          <Text style={styles.footerCopyright}>
            2024 © Kommutsera
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
    paddingVertical: 20,
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
    marginTop:50
  },
  headerTitle: {
    marginTop: 30,
    fontSize: 40,
    fontWeight: "bold",
    color: "#4A5568",
    textAlign: "justify",
  },
  highlight: {
    color: "#6A5AE0",
  },
  nameApp:{
  fontSize: 25,
  fontWeight:'semibold',
     color:'#424368',
  },
  subtitle: {
    marginTop: 10,
    marginBottom:5,
    fontSize: 14,
    color: "#A0AEC0",
  },
  teamName: {
    fontSize: 20,
    fontWeight: "bold",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A5568",
    marginBottom: 15,
    textAlign:"center",
  },
  aboutText: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 24,
    textAlign: "center",
  },
  teamSection: {
    paddingVertical: 30,
    backgroundColor: "#FFFFFF",
  },
  teamTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A5568",
    textAlign: "center",
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A5568",
  },
  memberRole: {
    fontSize: 14,
    color: "#A0AEC0",
    textAlign: "center",
  },
  footer: {
    backgroundColor: "#FFFFFF",
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
    color: "#A0AEC0",
    textAlign: "left",
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
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  brandTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#4A5568",
    textAlign: "center",
    marginTop:20
  },
  brandDescription: {
    fontSize: 12,
    color: "#A0AEC0",
    textAlign: "center",
    lineHeight: 16,
    marginTop: 10,
    flexWrap: 'wrap'
  },
  
  footerCopyright: {
    fontSize: 12,
    color: "#00000",
    textAlign: "center",
    marginTop:50,
    marginBottom:100,
    fontWeight:"500"
  },
});

export default About;
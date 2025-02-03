import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { FontAwesome5 } from '@expo/vector-icons'; // Importing FontAwesome5 for icons

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatar}></View>
        <Text style={styles.headerTitle}>
          Your Travel, Your Way, it's <Text style={styles.highlight}>Kommutsera!!</Text>
        </Text>
        <Text style={styles.subtitle}>Founded by</Text>
        <View style={styles.avatar}></View>
        <Text style={styles.teamName}>Group Name</Text>
        <Text style={styles.teamRole}>CCS IT-3 Students</Text>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>Kommutsera: Your Ultimate Metro Companion</Text>
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
            <View style={styles.memberAvatar}></View>
            <Text style={styles.memberName}>Johana Eunice Abellana</Text>
            <Text style={styles.memberRole}>Project Manager {"\n"} Head Researcher</Text>
          </View>
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}></View>
            <Text style={styles.memberName}>Joanah Marie L. Aldave</Text>
            <Text style={styles.memberRole}>Assistant Project Manager {"\n"} UI/UX Designer {"\n"} Head Researcher</Text>
          </View>
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}></View>
            <Text style={styles.memberName}>Gabriel Q. Bruzula</Text>
            <Text style={styles.memberRole}>Programmer</Text>
          </View>
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}></View>
            <Text style={styles.memberName}>Gerson A. Boyboy</Text>
            <Text style={styles.memberRole}>UI/UX Designer / Researcher</Text>
          </View>
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}></View>
            <Text style={styles.memberName}>Marc Jerald B. De Guzman</Text>
            <Text style={styles.memberRole}>Researcher</Text>
          </View>
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}></View>
            <Text style={styles.memberName}>Sean Zidane L. Dumlao</Text>
            <Text style={styles.memberRole}>Programmer</Text>
          </View>
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}></View>
            <Text style={styles.memberName}>Icko Cristian M. Llanillo</Text>
            <Text style={styles.memberRole}>Researcher</Text>
          </View>
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}></View>
            <Text style={styles.memberName}>Patricia Mae R. Romillo</Text>
            <Text style={styles.memberRole}>UI/UX Designer / Researcher</Text>
          </View>
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}></View>
            <Text style={styles.memberName}>Ashley A. Ruaza</Text>
            <Text style={styles.memberRole}>Programmer</Text>
          </View>
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}></View>
            <Text style={styles.memberName}>John Paul J. Saavedra</Text>
            <Text style={styles.memberRole}>Programmer</Text>
          </View>
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}></View>
            <Text style={styles.memberName}>John Cedric G. Salinas</Text>
            <Text style={styles.memberRole}>Programmer</Text>
          </View>
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}></View>
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
    <View style={styles.brandIcon}></View>
    <View>
      <Text style={styles.brandTitle}>Kommutsera</Text>
      <Text style={styles.brandDescription}>
        Conquer the Metro with ease!{"\n"}Kommutsera is your{"\n"}ultimate companion for{"\n"}hassle-free commuting.
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
    width: 80,
    height: 80,
    backgroundColor: "#3182ce",
    borderRadius: 40,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#4A5568",
    textAlign: "center",
  },
  highlight: {
    color: "#3182ce",
  },
  subtitle: {
    marginTop: 5,
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
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 24,
    textAlign: "center",
  },
  teamSection: {
    paddingVertical: 30,
    backgroundColor: "#E0E7FF",
  },
  teamTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A5568",
    textAlign: "center",
    marginBottom: 20,
  },
  teamGrid: {
    flexDirection: "column", // Stack the items vertically
    alignItems: "center",
  },
  teamMember: {
    alignItems: "center",
    marginBottom: 20,
  },
  memberAvatar: {
    width: 80,
    height: 80,
    backgroundColor: "#3182ce",
    borderRadius: 40,
    marginBottom: 10,
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
    backgroundColor: "#F9FAFB",
    paddingVertical: 40,
  },
footerGrid: {
  flexDirection: "column", // Stack the items vertically
  paddingHorizontal: 30,
  alignItems: "flex-start", // Align items to the left
  width: "100%", // Ensure full-width alignment
},
footerItem: {
  alignItems: "flex-start", // Align text and icons to the left
  marginBottom: 20,
  width: "100%", // Ensure items span the width
},
footerIcon: {
  fontSize: 30,
  color: "#3182ce",
  marginBottom: 10,
},
footerTitle: {
  fontWeight: "700",
  color: "#4A5568",
  fontSize: 16,
  textAlign: "left", // Align text to the left
},
footerDescription: {
  fontSize: 12,
  color: "#A0AEC0",
  textAlign: "left", // Align text to the left
},
  footerBottom: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    alignItems: "center",
  },
  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#3182ce",
    borderRadius: 8,
    marginRight: 10,
  },
  brandTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#4A5568",
  },
brandDescription: {
  fontSize: 12,
  color: "#A0AEC0",
  textAlign: "left", // Align to the left for a clean column look
  lineHeight: 16, // Add some space between the lines
  marginTop: 5,
},

footerCopyright: {
  fontSize: 12,
  color: "#A0AEC0",
  textAlign: "center",
  marginTop: 10,
},

});


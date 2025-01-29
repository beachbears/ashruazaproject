import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';

// Dropdown Component
interface DropdownProps {
  options: string[];
  onSelect?: (option: string) => void;
  defaultValue?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  options, 
  onSelect,
  defaultValue = 'Select Option' 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>(defaultValue);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };


  
  return (
    <View style={styles.newcontainer}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownButton}>
        <Text style={styles.buttonText}>{selectedOption}</Text>
        <Entypo name="chevron-down" size={20} color= '#44457D' />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => selectOption(option)}
              style={styles.option}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Main Screen Component
export default function TabTwoScreen() {
  const dropdownOptions = ['Destination', 'Fare Cost', 'Popularity', 'Time'];
  
  const handleOptionSelect = (option: string) => {
    console.log('Selected option:', option);
    // Add your logic here
  };

  return (
    <ScrollView style={styles.maincontainer}>
      <View style={{
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 8, 
        marginTop: 30
      }}>
        <Text style={{ color: '#44457D', fontWeight: '500', fontSize: 16 }}>Details</Text>
        <TouchableOpacity style={styles.postbutton} onPress={() => { }}>
          <Text style={{color: 'white', fontSize: 12 }}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.label}>Location</Text>
        <TextInput 
          style={styles.userlocation} 
          placeholder="Novaliches, Bayan Glori" 
          placeholderTextColor="#666" 
        />
        <Text style={[styles.label]}>Destination</Text>
        <TextInput 
          style={styles.userdestination} 
          placeholder="Intramuros, Manila City" 
          placeholderTextColor="#666" 
        />
      </View>

      <Text style={{
        color: '#44457D',
        fontWeight: '500',
        fontSize: 16, 
        marginTop: 20
      }}>Best Way</Text>

      <View style={styles.bestwaycard}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={styles.avatar}>
            <Text style={styles.avatarinitial}>KT</Text>
          </View>
          <Text style={styles.appname}>Kommutsera</Text>
        </View>
        <Text style={styles.bestwaydestination}>Destination: Intramuros, Manila</Text>
        <Text style={styles.bestwaydescription}>Tourist Spot Description</Text>
        <Text style={styles.bestway}>
          Intramuros represents the Philippines' colonial past,
          where the Spanish influence is deeply woven into the country's
          culture, architecture, and traditions. It is a symbol of both
          the glory and the struggles during the Spanish colonization.
          Today, it serves as a popular tourist destination that offers
          a look back in time, showcasing historical landmarks, museums,
          and the enduring spirit of the Filipino people
        </Text>

        <View style={styles.bestwayStatus}>
          <Octicons name="shield-check" size={16} color="#6366F1" />
          <Text style={styles.status}>Status</Text>
          <View style={styles.badge}>
            <Entypo name="check" size={14} color="#22C55E" />
            <Text style={styles.certified}>Certified Kommutsera</Text>
          </View>
        </View>
      </View>

      <View style={{
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        width: '100%',
        marginTop: 20,
        marginBottom: 13
      }}>
        <Text style={{
          color: '#44457D',
          fontWeight: '500',
          fontSize: 16
        }}>Route Post Suggestion</Text>

<View style={{ zIndex: 1000 }}>
        <Dropdown 
          options={dropdownOptions} 
          onSelect={handleOptionSelect}
          defaultValue="Select Option  "
          
         
        />
      </View>
      </View>

      <View style={styles.usercard}>
          <View style={styles.id}>
            <View style={styles.alignment}>
            <View style={styles.profile}>
              <Text style={styles.nn}>AR</Text>
            </View>
            <View style={styles.user}>
              <Text style={styles.name}>Ash Ruaza</Text>
              <Text style={styles.username}>@ashruaza</Text>
            </View>

            </View>
            <Text style={styles.timedate}>12 Hours ago</Text>
          </View>
          <Text style={styles.suggestorsdestination}>Destination: Intramuros, Manila</Text>
          <Text style={styles.touristexp}>Tourist Experience:</Text>
          <Text style={styles.suggestion}>
            Intramuros represents the Philippines' colonial past,
            where the Spanish influence is deeply woven into the country's
            culture, architecture, and traditions. It is a symbol of both
            the glory and the struggles during the Spanish colonization.
            Today, it serves as a popular tourist destination that offers
            a look back in time, showcasing historical landmarks, museums,
            and the enduring spirit of the Filipino people
          </Text>

          <View style={styles.iconStatus}>
            <View style={styles.content}>
            <Octicons name="shield-check" size={18} color="#6366F1" />
            <Text style={styles.status}>Status</Text>
            <View style={styles.badge}>
              <Entypo name="check" size={14} color="#03C04A" />
              <Text style={styles.cert}>Certified Kommutsera</Text>
            </View>
            </View>

            <View style={styles.arrowcontainer}>
            <View style={styles.arrowup}>
              <AntDesign name="arrowup" size={15} color="#03C04A" />
              <Text style={[styles.num, { color: '#22c55e' }]}>11</Text>
            </View>

            <View style={styles.arrowdown}>
              <AntDesign name="arrowdown" size={15} color="red" />
              <Text style={[styles.num, { color: 'red' }]}>4</Text>
            </View>
            </View>
          </View>
        </View>

        <View style={styles.usercard}>
          <View style={styles.id}>
            <View style={styles.alignment}>
            <View style={styles.profile}>
              <Text style={styles.nn}>AR</Text>
            </View>
            <View style={styles.user}>
              <Text style={styles.name}>Ash Ruaza</Text>
              <Text style={styles.username}>@ashruaza</Text>
            </View>

            </View>
            <Text style={styles.timedate}>12 Hours ago</Text>
          </View>
          <Text style={styles.suggestorsdestination}>Destination: Intramuros, Manila</Text>
          <Text style={styles.touristexp}>Tourist Experience:</Text>
          <Text style={styles.suggestion}>
            Intramuros represents the Philippines' colonial past,
            where the Spanish influence is deeply woven into the country's
            culture, architecture, and traditions. It is a symbol of both
            the glory and the struggles during the Spanish colonization.
            Today, it serves as a popular tourist destination that offers
            a look back in time, showcasing historical landmarks, museums,
            and the enduring spirit of the Filipino people
          </Text>

          <View style={styles.iconStatus}>
            <View style={styles.content}>
            <Octicons name="shield-check" size={18} color="#6366F1" />
            <Text style={styles.status}>Status</Text>
            <View style={styles.badge}>
              <Entypo name="check" size={14} color="#03C04A" />
              <Text style={styles.cert}>Certified Kommutsera</Text>
            </View>
            </View>

            <View style={styles.arrowcontainer}>
            <View style={styles.arrowup}>
              <AntDesign name="arrowup" size={15} color="#03C04A" />
              <Text style={[styles.num, { color: '#22c55e' }]}>11</Text>
            </View>

            <View style={styles.arrowdown}>
              <AntDesign name="arrowdown" size={15} color="red" />
              <Text style={[styles.num, { color: 'red' }]}>4</Text>
            </View>
            </View>
          </View>
        </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginLeft: 300, marginBottom: 100 }}>
        <TouchableOpacity style={styles.floatingButton} >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  maincontainer: { 
    flexDirection: 'column', 
    padding: 30, 
    backgroundColor: '#F9FAFB', 
    width: '100%' 
  },
  postbutton: {
    backgroundColor: '#6366F1', 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 10, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 8,
  },
  label: {
    fontSize: 12, 
    fontWeight: '500', 
    color: '#6B7280', 
    marginTop: 10
  },
  userlocation: {
    backgroundColor: '#F5F7FF', 
    borderWidth: 1, 
    borderColor: '#C7D2FE', 
    borderRadius: 8, 
    padding: 8, 
    fontSize: 11, 
    color: '#374151', 
    marginVertical: 8,
  },
  userdestination: {
    backgroundColor: '#F5F7FF', 
    borderWidth: 1, 
    borderColor: '#C7D2FE', 
    borderRadius: 8, 
    padding: 8,
    fontSize: 11, 
    color: '#374151', 
    marginVertical: 8,
  },
  bestwaycard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 20, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4, 
    marginBottom: 18,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarinitial: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  appname: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  bestwaydestination: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50,
    marginVertical: 16,
  },
  bestwaydescription: {
    fontSize: 12,
    marginVertical: 4,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50,
    marginBottom: 6
  },
  bestway: {
    fontSize: 12,
    color: '#6B7280',
    flexWrap: 'wrap',
    marginLeft: 50,
    marginBottom: 10
  },
  bestwayStatus: {
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  status: {
    fontSize: 11,
    color: '#404163',
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: '700',
  
  },
  badge: {
    borderWidth: 1,
    borderColor: '#ABEBA2',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
    backgroundColor: '#ecfdf5',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  certified: {
    color: '#22C55E',
    fontWeight: '700',
    fontSize: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  newcontainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dropdownButton: {
    backgroundColor: '#F5F7FF', 
    borderWidth: 1, 
    borderColor: '#C7D2FE', 
    borderRadius: 8, 
    width: 125,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
  },
  buttonText: {
    color: '#44457D',
    fontSize: 13,
    fontWeight: '400',
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#E5E7EB',
    zIndex: 1000,
    width: 125,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    top: 40
  },
  option: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 4,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 13,
    color: '#44457D',
  },
  usercard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 2,
    zIndex: -1,
    marginBottom: 20
  },

  profile: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  nn: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 12,
    color: '#6B7280',
  },
  suggestion: {
    fontSize: 12,
    color: '#6B7280',
    flexWrap: 'wrap',
    marginLeft: 50,
  },

  suggestorsdestination: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 50,
    marginTop: 10,
    marginBottom: 6
  },

  iconStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    marginTop: 16,
  },
  cert: {
    color: '#22c55e',
    fontWeight: '500',
    fontSize: 11, 
  },

  user: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  name: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
  },
  touristexp: {
    marginVertical: 10,
    marginLeft: 50,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  timedate: {
    fontSize: 12,
    color: '#6B7280',
  },
  id: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },

  alignment: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  arrowup: {
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 5,
    paddingHorizontal: 3,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowdown: {
    borderWidth: 1,
    borderColor: '#f47357',
    borderRadius: 5,
    paddingHorizontal: 3,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  num: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '600',
  },

  floatingButton: { position: 'relative', width: 40, height: 40, borderRadius: 28, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 4, elevation: 6, marginTop: 30 },
  floatingButtonText: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 'bold', },
 
});
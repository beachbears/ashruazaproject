// types.ts
export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    buttonNav: undefined;
    ButtonNav: undefined; // Add ButtonNav to the stack param list
    // Postmodal: undefined;
  };
  
  export type HeaderProps = {
    title: string;
    onToggleDropdown: () => void;
    showDropdown: boolean;
    isLoggedIn: boolean;
    navigation: any;
    onLogout?: () => void;  // Add this line
  };
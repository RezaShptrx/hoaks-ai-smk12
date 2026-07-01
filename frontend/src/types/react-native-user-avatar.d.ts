declare module 'react-native-user-avatar' {
  import { ComponentType } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  export interface UserAvatarProps {
    name?: string;
    src?: string;
    bgColor?: string;
    textColor?: string;
    size?: number;
    imageStyle?: any;
    style?: ViewStyle;
    textStyle?: TextStyle;
    borderRadius?: number;
    component?: any;
  }

  const UserAvatar: ComponentType<UserAvatarProps>;
  export default UserAvatar;
}

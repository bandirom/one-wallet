import { useAppColorScheme } from '@procivis/react-native-components';
import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const PincodeIcon: React.FunctionComponent<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        d="M2.75121 1.37515C2.75121 2.13515 2.13522 2.75115 1.37655 2.75115C0.615216 2.75115 0.000549316 2.13515 0.000549316 1.37515C0.000549316 0.616488 0.615216 0.000488281 1.37655 0.000488281C2.13522 0.000488281 2.75121 0.616488 2.75121 1.37515Z"
        fill={colorScheme.text}
      />
      <Path
        fillRule="evenodd"
        d="M8.70959 1.37515C8.70959 2.13515 8.09359 2.75115 7.33359 2.75115C6.57359 2.75115 5.95892 2.13515 5.95892 1.37515C5.95892 0.616488 6.57359 0.000488281 7.33359 0.000488281C8.09359 0.000488281 8.70959 0.616488 8.70959 1.37515Z"
        fill={colorScheme.text}
      />
      <Path
        d="M14.6667 1.37515C14.6667 2.13515 14.0507 2.75115 13.292 2.75115C12.5307 2.75115 11.916 2.13515 11.916 1.37515C11.916 0.616488 12.5307 0.000488281 13.292 0.000488281C14.0507 0.000488281 14.6667 0.616488 14.6667 1.37515Z"
        fill={colorScheme.text}
      />
      <Path
        d="M2.75121 7.33352C2.75121 8.09219 2.13522 8.70819 1.37655 8.70819C0.615216 8.70819 0.000549316 8.09219 0.000549316 7.33352C0.000549316 6.57352 0.615216 5.95752 1.37655 5.95752C2.13522 5.95752 2.75121 6.57352 2.75121 7.33352Z"
        fill={colorScheme.text}
      />
      <Path
        d="M8.70959 7.33352C8.70959 8.09219 8.09359 8.70819 7.33359 8.70819C6.57359 8.70819 5.95892 8.09219 5.95892 7.33352C5.95892 6.57352 6.57359 5.95752 7.33359 5.95752C8.09359 5.95752 8.70959 6.57352 8.70959 7.33352Z"
        fill={colorScheme.text}
      />
      <Path
        d="M14.6667 7.33352C14.6667 8.09219 14.0507 8.70819 13.292 8.70819C12.5307 8.70819 11.916 8.09219 11.916 7.33352C11.916 6.57352 12.5307 5.95752 13.292 5.95752C14.0507 5.95752 14.6667 6.57352 14.6667 7.33352Z"
        fill={colorScheme.text}
      />
      <Path
        d="M2.75121 13.2904C2.75121 14.0504 2.13522 14.6664 1.37655 14.6664C0.615216 14.6664 0.000549316 14.0504 0.000549316 13.2904C0.000549316 12.5318 0.615216 11.9158 1.37655 11.9158C2.13522 11.9158 2.75121 12.5318 2.75121 13.2904Z"
        fill={colorScheme.text}
      />
      <Path
        d="M8.70959 13.2904C8.70959 14.0504 8.09359 14.6664 7.33359 14.6664C6.57359 14.6664 5.95892 14.0504 5.95892 13.2904C5.95892 12.5318 6.57359 11.9158 7.33359 11.9158C8.09359 11.9158 8.70959 12.5318 8.70959 13.2904Z"
        fill={colorScheme.text}
      />
      <Path
        d="M14.6667 13.2904C14.6667 14.0504 14.0507 14.6664 13.292 14.6664C12.5307 14.6664 11.916 14.0504 11.916 13.2904C11.916 12.5318 12.5307 11.9158 13.292 11.9158C14.0507 11.9158 14.6667 12.5318 14.6667 13.2904Z"
        fill={colorScheme.text}
      />
    </Svg>
  );
};

export default PincodeIcon;

import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const ServicesIcon: React.FunctionComponent<SvgProps> = ({ color = 'black', ...props }) => {
  return (
    <Svg width={65} height={64} viewBox="0 0 65 64" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        d="M18.7018 34.1739C13.7924 34.1739 9.8125 38.1644 9.8125 43.087C9.8125 48.0095 13.7924 52 18.7018 52C23.6113 52 27.5912 48.0095 27.5912 43.087C27.5912 40.7231 26.6546 38.456 24.9875 36.7845C23.3205 35.113 21.0594 34.1739 18.7018 34.1739ZM18.7014 48.1283C16.0347 48.1268 13.8658 45.974 13.8374 43.3003C13.809 40.6266 15.9317 38.4279 18.5977 38.3695C21.2638 38.311 23.4803 40.4146 23.5685 43.087C23.6121 44.4089 23.1186 45.692 22.2011 46.6424C21.2836 47.5928 20.0206 48.129 18.7014 48.1283Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        d="M45.3698 34.1739C40.4604 34.1739 36.4805 38.1644 36.4805 43.087C36.4805 48.0095 40.4604 52 45.3698 52C50.2792 52 54.2591 48.0095 54.2591 43.087C54.2591 40.7231 53.3226 38.456 51.6555 36.7845C49.9884 35.113 47.7274 34.1739 45.3698 34.1739ZM45.3695 48.1283C42.7028 48.1268 40.5338 45.974 40.5054 43.3003C40.477 40.6266 42.5997 38.4279 45.2658 38.3695C47.9318 38.311 50.1484 40.4146 50.2365 43.087C50.2801 44.4089 49.7867 45.692 48.8692 46.6424C47.9516 47.5928 46.6887 48.129 45.3695 48.1283Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        d="M41.8143 19.913C41.8143 14.9905 37.8344 11 32.925 11C28.0155 11 24.0356 14.9905 24.0356 19.913C24.0356 24.8356 28.0155 28.8261 32.925 28.8261C37.8344 28.8261 41.8143 24.8356 41.8143 19.913ZM32.9245 24.793C30.2365 24.793 28.0575 22.6082 28.0575 19.913C28.0575 17.2179 30.2365 15.033 32.9245 15.033C35.6125 15.033 37.7915 17.2179 37.7915 19.913C37.7915 21.2073 37.2788 22.4485 36.366 23.3637C35.4533 24.2789 34.2153 24.793 32.9245 24.793Z"
        fill={color}
      />
    </Svg>
  );
};

export default ServicesIcon;

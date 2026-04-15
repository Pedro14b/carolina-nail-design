import React from 'react';
import Svg, { Path, Text, G, Defs, LinearGradient, Stop, Circle, Ellipse } from 'react-native-svg';

export const CarolinaLogo = ({ size = 200, variant = 'full' }) => {
  if (variant === 'icon') {
    // Versão apenas do "C"
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="cGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#C97C7C" />
            <Stop offset="100%" stopColor="#8B4A4A" />
          </LinearGradient>
        </Defs>
        <Path
          d="M 50 15 Q 30 15 20 30 Q 10 45 10 60 Q 10 75 20 90 Q 30 100 50 100 Q 60 100 70 95"
          fill="none"
          stroke="url(#cGradient)"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  // Versão completa com texto
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#D4897A" />
          <Stop offset="50%" stopColor="#C97C7C" />
          <Stop offset="100%" stopColor="#8B4A4A" />
        </LinearGradient>
        <LinearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E8A9A9" />
          <Stop offset="100%" stopColor="#D4897A" />
        </LinearGradient>
        <LinearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#D4B38C" />
          <Stop offset="100%" stopColor="#A28058" />
        </LinearGradient>
        <LinearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F6C1CC" />
          <Stop offset="100%" stopColor="#D37D8D" />
        </LinearGradient>
      </Defs>

      {/* Decoração - Linhas elegantes */}
      <Path
        d="M 130 98 Q 560 10 980 128"
        stroke="url(#accentGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <Path
        d="M 300 425 Q 610 505 980 372"
        stroke="url(#accentGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <Path
        d="M 312 442 Q 620 522 992 388"
        stroke="url(#accentGradient)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Texto "Carolina" */}
      <Text
        x="520"
        y="285"
        textAnchor="middle"
        fontSize="168"
        fontWeight="600"
        fontFamily="Georgia, serif"
        fill="url(#mainGradient)"
        letterSpacing="1"
      >
        Carolina
      </Text>

      {/* Texto "NAIL DESIGN" */}
      <Text
        x="520"
        y="362"
        textAnchor="middle"
        fontSize="60"
        fontWeight="500"
        fontFamily="Georgia, serif"
        fill="url(#mainGradient)"
        letterSpacing="9"
      >
        NAIL DESIGN
      </Text>

      {/* Decoração de pontos */}
      <Circle cx="272" cy="356" r="5" fill="url(#mainGradient)" opacity="0.72" />
      <Circle cx="768" cy="356" r="5" fill="url(#mainGradient)" opacity="0.72" />

      {/* Elemento de brilho */}
      <Path
        d="M 760 118 L 774 100 L 765 136"
        stroke="url(#accentGradient)"
        strokeWidth="2"
        fill="none"
        opacity="0.65"
      />
      <Path
        d="M 150 294 L 164 278 L 156 308"
        stroke="url(#accentGradient)"
        strokeWidth="2"
        fill="none"
        opacity="0.58"
      />

      {/* Grupo floral à direita (ornamento) */}
      <G opacity="0.95">
        <Circle cx="965" cy="290" r="40" fill="url(#roseGradient)" />
        <Circle cx="1018" cy="345" r="34" fill="url(#roseGradient)" opacity="0.95" />
        <Circle cx="950" cy="284" r="18" fill="#FDE5EA" opacity="0.85" />
        <Circle cx="1001" cy="340" r="16" fill="#FDE5EA" opacity="0.85" />

        <Ellipse cx="1045" cy="235" rx="14" ry="30" fill="url(#leafGradient)" transform="rotate(20 1045 235)" />
        <Ellipse cx="1068" cy="286" rx="14" ry="30" fill="url(#leafGradient)" transform="rotate(34 1068 286)" />
        <Ellipse cx="1050" cy="396" rx="14" ry="30" fill="url(#leafGradient)" transform="rotate(30 1050 396)" />
        <Ellipse cx="972" cy="430" rx="14" ry="30" fill="url(#leafGradient)" transform="rotate(-18 972 430)" />
        <Ellipse cx="928" cy="405" rx="12" ry="25" fill="url(#leafGradient)" transform="rotate(-35 928 405)" />
      </G>
    </Svg>
  );
};

// Versão compacta para headers
export const CarolinaLogoSmall = ({ size = 80 }) => (
  <Svg width={size} height={size * 0.5} viewBox="0 0 500 260" preserveAspectRatio="xMidYMid meet">
    <Defs>
      <LinearGradient id="smallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#C97C7C" />
        <Stop offset="100%" stopColor="#8B4A4A" />
      </LinearGradient>
    </Defs>

    <Text
      x="250"
      y="110"
      textAnchor="middle"
      fontSize="82"
      fontWeight="600"
      fontFamily="Georgia, serif"
      fill="url(#smallGradient)"
      letterSpacing="1"
    >
      Carolina
    </Text>

    <Text
      x="250"
      y="165"
      textAnchor="middle"
      fontSize="30"
      fontWeight="400"
      fontFamily="Georgia, serif"
      fill="url(#smallGradient)"
      letterSpacing="4"
      opacity="0.8"
    >
      NAIL DESIGN
    </Text>
  </Svg>
);

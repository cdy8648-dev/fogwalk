import { useEffect, useRef } from 'react';
import { Animated, Easing, useWindowDimensions } from 'react-native';

import { COLORS } from '../../constants/colors';

/**
 * 콘페티 낙하 연출 — 팝업 등장 시 상단에서 조각이 떨어지며 회전(도파민용).
 * 스펙: 28~30개, 6색 랜덤, 낙하 2.3~4.1s / 딜레이 0~2.4s, 620° 회전(linear),
 * opacity 0→1(첫 12%)→0.85 유지, 노출 동안 무한 loop. 터치 비간섭(pointerEvents none).
 * 레이어: 배경 글로우 < 콘페티 < 뱃지/타이틀/버튼 (호출부에서 순서로 제어).
 */

const PALETTE = [
  COLORS.lime, // #C8F560
  COLORS.teal, // #5BC0BE
  COLORS.hotpink, // #FF6BB5
  COLORS.gold, // #E0A458
  COLORS.land, // #EDEAE0 아이보리
  COLORS.violet, // #8B7CFF
];

interface PieceSpec {
  left: number; // %
  w: number;
  h: number;
  color: string;
  duration: number;
  delay: number;
  round: boolean; // true=원(40%), false=둥근 사각(60%)
}

function makePieces(count: number): PieceSpec[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    w: 5 + Math.random() * 5, // 5~10
    h: 8 + Math.random() * 8, // 8~16
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    duration: 2300 + Math.random() * 1800, // 2.3~4.1s
    delay: Math.random() * 2400, // 0~2.4s
    round: Math.random() > 0.6, // 40% 원
  }));
}

function ConfettiPiece({ spec, fallH }: { spec: PieceSpec; fallH: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(spec.delay),
      Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration: spec.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [v, spec.delay, spec.duration]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -30,
        left: `${spec.left}%`,
        width: spec.w,
        height: spec.h,
        backgroundColor: spec.color,
        borderRadius: spec.round ? spec.w / 2 : 2,
        opacity: v.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 1, 0.85] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, fallH] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '620deg'] }) },
        ],
      }}
    />
  );
}

export default function ConfettiField({ count = 28 }: { count?: number }) {
  const { height } = useWindowDimensions();
  // 조각 배치는 마운트 시 1회 고정
  const pieces = useRef(makePieces(count)).current;
  return (
    <>
      {pieces.map((spec, i) => (
        <ConfettiPiece key={i} spec={spec} fallH={height + 60} />
      ))}
    </>
  );
}

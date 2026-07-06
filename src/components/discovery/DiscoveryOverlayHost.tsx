import { useDiscoveryPopupStore } from '../../store/discoveryPopupStore';
import DiscoveryCardPopup from './DiscoveryCardPopup';
import DiscoveryMomentOverlay from './DiscoveryMomentOverlay';

/** 발견 보상 팝업 호스트 — 앱 루트에 마운트. 02 발견 순간 → 03 발견 카드. */
export default function DiscoveryOverlayHost() {
  const phase = useDiscoveryPopupStore((s) => s.phase);
  if (phase === 'moment') return <DiscoveryMomentOverlay />;
  if (phase === 'cards') return <DiscoveryCardPopup />;
  return null;
}

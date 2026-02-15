import "./FloatingBackground.css";

export default function FloatingBackground() {
  return (
    <div className="floating-container">
      <div className="gradient-layer" />

      {/* Row 1 */}
      <div className="icon small camera icon1" />
      <div className="icon medium video icon2" />
      <div className="icon small spark icon3" />
      <div className="icon medium camera icon4" />
      <div className="icon large video icon5" />

      {/* Row 2 */}
      <div className="icon small spark icon6" />
      <div className="icon medium camera icon7" />
      <div className="icon small video icon8" />
      <div className="icon large spark icon9" />
      <div className="icon medium camera icon10" />

      {/* Row 3 */}
      <div className="icon small video icon11" />
      <div className="icon medium spark icon12" />
      <div className="icon large camera icon13" />
      <div className="icon small spark icon14" />
      <div className="icon medium video icon15" />

      {/* Row 4 */}
      <div className="icon large spark icon16" />
      <div className="icon medium camera icon17" />
      <div className="icon small video icon18" />
      <div className="icon medium spark icon19" />
      <div className="icon small camera icon20" />
    </div>
  );
}

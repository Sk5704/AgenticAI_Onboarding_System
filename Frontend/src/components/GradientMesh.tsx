const GradientMesh = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Primary blob */}
      <div
        className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-20 animate-[drift_20s_ease-in-out_infinite]"
        style={{
          background: "radial-gradient(circle, hsl(170 55% 40%) 0%, transparent 70%)",
        }}
      />
      {/* Accent blob */}
      <div
        className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full opacity-15 animate-[drift_25s_ease-in-out_infinite_reverse]"
        style={{
          background: "radial-gradient(circle, hsl(48 80% 55%) 0%, transparent 70%)",
        }}
      />
      {/* Secondary blob */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-10 animate-[drift_18s_ease-in-out_infinite_2s]"
        style={{
          background: "radial-gradient(ellipse, hsl(170 45% 50%) 0%, transparent 70%)",
        }}
      />
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(150 20% 10%) 1px, transparent 1px), linear-gradient(90deg, hsl(150 20% 10%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
};

export default GradientMesh;

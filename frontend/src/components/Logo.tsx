import { useMantineColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";

// Change the public asset URL once so browsers holding the original Pingvin
// logo cannot reuse that cached response. The reverse proxy also sends
// no-store headers for branding assets so future admin logo changes appear
// without requiring a hard refresh.
const logoAssetRevision = "ooda-files-20260826-2";
const defaultLogoSrc = `/img/logo.png?v=${logoAssetRevision}`;
const darkLogoSrc = `/img/logo-dark.png?v=${logoAssetRevision}`;

const Logo = ({ height, width }: { height: number; width: number }) => {
  const { colorScheme } = useMantineColorScheme();
  const preferredLogoSrc =
    colorScheme === "dark" ? darkLogoSrc : defaultLogoSrc;
  const [logoSrc, setLogoSrc] = useState(preferredLogoSrc);

  useEffect(() => {
    setLogoSrc(preferredLogoSrc);
  }, [preferredLogoSrc]);

  return (
    <img
      src={logoSrc}
      alt="OODA Files"
      height={height}
      style={{
        height,
        width: "auto",
        maxWidth: width * 2,
        objectFit: "contain",
      }}
      onError={() => {
        if (logoSrc !== defaultLogoSrc) setLogoSrc(defaultLogoSrc);
      }}
    />
  );
};
export default Logo;

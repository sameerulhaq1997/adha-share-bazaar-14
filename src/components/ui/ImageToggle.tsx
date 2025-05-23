
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { configService } from "@/services/configService";

export const ImageToggle = () => {
  const [showImages, setShowImages] = useState(configService.getShowProductImages());

  // Handle toggle
  const toggleImages = () => {
    const newValue = !showImages;
    setShowImages(newValue);
    configService.setShowProductImages(newValue);
  };

  // Listen for changes from other components
  useEffect(() => {
    const handleConfigChange = (event: CustomEvent) => {
      setShowImages(event.detail.showProductImages);
    };

    window.addEventListener(
      'product-images-setting-changed',
      handleConfigChange as EventListener
    );

    return () => {
      window.removeEventListener(
        'product-images-setting-changed',
        handleConfigChange as EventListener
      );
    };
  }, []);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleImages}
      className="flex gap-1 items-center"
      title={showImages ? "Hide product images" : "Show product images"}
    >
      {showImages ? (
        <>
          <EyeOff className="h-4 w-4" />
          <span className="hidden sm:inline">Hide Images</span>
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Show Images</span>
        </>
      )}
    </Button>
  );
};

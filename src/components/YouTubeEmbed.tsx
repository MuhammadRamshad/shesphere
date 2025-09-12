
import React from "react";

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, title }) => {
  // Construct the embed URL
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  
  return (
    <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-lg shadow-md">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full rounded-lg"
      />
    </div>
  );
};

export default YouTubeEmbed;

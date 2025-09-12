import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, PlayCircle } from "lucide-react";
import { IResource } from "@/types";
import YouTubeEmbed from "./YouTubeEmbed";

interface ResourceVideoCardProps {
  resource: IResource;
  onClick?: () => void;
}

const ResourceVideoCard: React.FC<ResourceVideoCardProps> = ({
  resource,
  onClick,
}) => {
  const getYouTubeId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = resource.url ? getYouTubeId(resource.url) : null;

  return (
    <Card className="h-[350px] md:h-[380px] overflow-hidden h-full flex flex-col border-she-indigo/20 hover:border-she-indigo/50 transition-all duration-300 hover:shadow-md bg-white">
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        {videoId ? (
          <YouTubeEmbed videoId={videoId} title={resource.title} />
        ) : resource.imageUrl ? (
          <div className="relative">
            <img
              src={resource.imageUrl}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <PlayCircle className="h-16 w-16 text-white opacity-80" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-she-lavender/20">
            <PlayCircle className="h-16 w-16 text-she-purple opacity-50" />
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-she-dark line-clamp-1">
            {resource.title}
          </CardTitle>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-she-lavender/20 text-she-indigo">
            {resource.category}
          </span>
        </div>
        <CardDescription className="line-clamp-2 text-sm text-gray-600">
          {resource.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <p className="text-sm text-gray-600 line-clamp-3">
          {resource.content}
        </p>
      </CardContent>
      <CardFooter className="pt-2">
        {resource.url && (
          <Button
            variant="outline"
            className="w-full border-she-purple/20 text-she-indigo hover:bg-she-lavender/10 hover:text-she-purple"
            onClick={onClick}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Watch Video
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResourceVideoCard;

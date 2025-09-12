
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import ResourceVideoCard from "@/components/ResourceVideoCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getAllResources, getResourcesByCategory } from "@/services/resourceService";
import { useQuery } from "@tanstack/react-query";
import { IResource } from "@/types"; // Import from types

const Resources = () => {
  const [resources, setResources] = useState<IResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<IResource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Use React Query to fetch resources
  const { data: resourcesData, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: getAllResources,
  });

  useEffect(() => {
    if (resourcesData) {
      // Set the resources state with the data from the API
      setResources(resourcesData);
      setFilteredResources(resourcesData);
    }
  }, [resourcesData]);

  useEffect(() => {
    // Filter resources based on search query
    if (searchQuery.trim() === "") {
      // If search query is empty, show all resources or filter by active category
      if (activeCategory === "all") {
        setFilteredResources(resources);
      } else {
        setFilteredResources(
          resources.filter((resource) => {
            if (typeof resource.category === 'string') {
              return resource.category === activeCategory;
            } else if (Array.isArray(resource.category)) {
              return resource.category.includes(activeCategory);
            }
            return false;
          })
        );
      }
    } else {
      // Filter by search query and active category
      setFilteredResources(
        resources.filter(
          (resource) => {
            const categoryMatch = activeCategory === "all" || 
              (typeof resource.category === 'string' 
                ? resource.category === activeCategory
                : Array.isArray(resource.category) && resource.category.includes(activeCategory));
              
            return categoryMatch && (
              resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              resource.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
        )
      );
    }
  }, [searchQuery, activeCategory, resources]);

  // Function to handle category change
  const handleCategoryChange = async (category: string) => {
    setActiveCategory(category);
    
    if (category === "all") {
      if (resourcesData) {
        setFilteredResources(resourcesData);
      }
    } else {
      try {
        const categoryResources = await getResourcesByCategory(category);
        setFilteredResources(categoryResources);
      } catch (error) {
        console.error("Error fetching resources by category:", error);
        // Fallback to client-side filtering
        if (resourcesData) {
          setFilteredResources(
            resourcesData.filter((resource) => {
              if (typeof resource.category === 'string') {
                return resource.category === category;
              } else if (Array.isArray(resource.category)) {
                return resource.category.includes(category);
              }
              return false;
            })
          );
        }
      }
    }
  };

  // Function to handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-she-dark mb-2">Health & Safety Resources</h1>
          <p className="text-gray-600">Explore educational videos and guides to improve your knowledge</p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="search"
              placeholder="Search resources..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <Tabs defaultValue="all" className="w-full" onValueChange={handleCategoryChange}>
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="safety">Safety</TabsTrigger>
              <TabsTrigger value="wellness">Wellness</TabsTrigger>
              <TabsTrigger value="mental">Mental Health</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-she-purple border-r-transparent"></div>
                  <p className="mt-4 text-gray-600">Loading resources...</p>
                </div>
              ) : filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <ResourceVideoCard
                      key={resource._id}
                      resource={resource}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-600">No resources found matching your search criteria.</p>
                </div>
              )}
            </TabsContent>
            
            {/* The TabsContent for the other categories will use the same filtered resources, 
                filtering is handled via the handleCategoryChange function */}
            <TabsContent value="health" className="space-y-4">
              {/* Content will be handled by the useEffect above */}
            </TabsContent>
            <TabsContent value="safety" className="space-y-4">
              {/* Content will be handled by the useEffect above */}
            </TabsContent>
            <TabsContent value="wellness" className="space-y-4">
              {/* Content will be handled by the useEffect above */}
            </TabsContent>
            <TabsContent value="mental" className="space-y-4">
              {/* Content will be handled by the useEffect above */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Resources;

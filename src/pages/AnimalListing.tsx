import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Loader } from "lucide-react";
import { animalService, Animal } from "@/services/animalService";

const ITEMS_PER_PAGE = 6;

const AnimalListing = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  
  // Fetch animals from API service
  useEffect(() => {
    const fetchAnimals = async () => {
      setLoading(true);
      try {
        const data = await animalService.getAllAnimals();
        setAnimals(data);
        setFilteredAnimals(data);
      } catch (error) {
        console.error("Failed to fetch animals:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnimals();
  }, []);
  
  // Filter animals based on selected filters
  useEffect(() => {
    let result = animals;
    
    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(animal => animal.category === selectedCategory);
    }
    
    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      result = result.filter(animal => animal.price >= min && (max ? animal.price <= max : true));
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        animal => 
          animal.name.toLowerCase().includes(query) || 
          animal.breed.toLowerCase().includes(query) ||
          animal.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredAnimals(result);
    setTotalPages(Math.ceil(result.length / ITEMS_PER_PAGE));
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedCategory, priceRange, searchQuery, animals]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAnimals.slice(0, endIndex);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setLoadMoreLoading(true);
      // Simulate network delay for better UX
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setLoadMoreLoading(false);
      }, 500);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of the listing
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="container px-4 sm:px-8 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Available Animals</h1>
      <p className="text-muted-foreground mb-8">
        Browse our selection of quality animals for Qurbani. Book shares or full animals.
      </p>
      
      {/* Filters */}
      <div className="bg-secondary p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search animals..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Category
            </label>
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Animals</SelectItem>
                <SelectItem value="cow">Cow</SelectItem>
                <SelectItem value="goat">Goat</SelectItem>
                <SelectItem value="sheep">Sheep</SelectItem>
                <SelectItem value="camel">Camel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Price Range
            </label>
            <Select 
              value={priceRange} 
              onValueChange={setPriceRange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Price</SelectItem>
                <SelectItem value="0-15000">Under 15,000</SelectItem>
                <SelectItem value="15000-25000">15,000 - 25,000</SelectItem>
                <SelectItem value="25000-40000">25,000 - 40,000</SelectItem>
                <SelectItem value="40000-100000">Above 40,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Tab Categories */}
      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setSelectedCategory("all")}>
            All Animals
          </TabsTrigger>
          <TabsTrigger value="cow" onClick={() => setSelectedCategory("cow")}>
            Cows
          </TabsTrigger>
          <TabsTrigger value="goat" onClick={() => setSelectedCategory("goat")}>
            Goats
          </TabsTrigger>
          <TabsTrigger value="sheep" onClick={() => setSelectedCategory("sheep")}>
            Sheep
          </TabsTrigger>
          <TabsTrigger value="camel" onClick={() => setSelectedCategory("camel")}>
            Camels
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <AnimalGrid animals={getCurrentPageItems()} loading={loading} />
        </TabsContent>
        <TabsContent value="cow" className="mt-6">
          <AnimalGrid animals={getCurrentPageItems()} loading={loading} />
        </TabsContent>
        <TabsContent value="goat" className="mt-6">
          <AnimalGrid animals={getCurrentPageItems()} loading={loading} />
        </TabsContent>
        <TabsContent value="sheep" className="mt-6">
          <AnimalGrid animals={getCurrentPageItems()} loading={loading} />
        </TabsContent>
        <TabsContent value="camel" className="mt-6">
          <AnimalGrid animals={getCurrentPageItems()} loading={loading} />
        </TabsContent>
      </Tabs>
      
      {/* Pagination */}
      {!loading && filteredAnimals.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-6">
          {currentPage < totalPages && (
            <Button 
              onClick={handleLoadMore} 
              variant="outline" 
              className="w-full md:w-1/3"
              disabled={loadMoreLoading}
            >
              {loadMoreLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Animals"
              )}
            </Button>
          )}
          
          {/* Pagination controls */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <p className="text-sm text-muted-foreground">
            Showing {getCurrentPageItems().length} of {filteredAnimals.length} animals
          </p>
        </div>
      )}
    </div>
  );
};

const AnimalGrid = ({ animals, loading }: { animals: Animal[], loading: boolean }) => {
  debugger;
  if (loading) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">Loading animals...</h3>
      </div>
    );
  }
  
  if (animals.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-muted-foreground">No animals found matching your criteria.</h3>
        <p className="mt-2 text-muted-foreground">Try changing your filters or check back later for new listings.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {animals.map((animal) => (
        <Card key={animal.id} className="overflow-hidden border-brand-200 hover:shadow-md transition-shadow">
          <div className="aspect-video relative">
           <img
  src={animal.imageUrl && animal.imageUrl !== "" ? animal.imageUrl : "/lovable-uploads/cow.jpeg"}
  alt={animal.name}
  className="w-full h-full object-cover"
/>
            <div className="absolute top-2 right-2 bg-brand-600 text-white px-2 py-1 rounded text-sm font-medium">
              {animal.category === "cow" ? "7 Shares" : "Full Animal"}
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{animal.name}</h3>
              <span className="text-brand-700 font-bold">PKR {animal.price ? animal.price.toLocaleString() : '0'}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{animal.description}</p>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Availability:</span>
                <span className="font-medium">
                  {animal.remainingShares}/{animal.totalShares} shares available
                </span>
              </div>
              <div className="progress-bar bg-muted">
                <div 
                  className="h-full bg-brand-500"
                  style={{ 
                    width: `${(animal.bookedShares / animal.totalShares) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-muted-foreground">Breed</span>
                <p className="font-medium">{animal.breed}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Weight</span>
                <p className="font-medium">{animal.weight} kg</p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-6 pt-0">
            <Button asChild className="w-full bg-brand-600 hover:bg-brand-700">
              <Link to={`/animal/${animal.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AnimalListing;

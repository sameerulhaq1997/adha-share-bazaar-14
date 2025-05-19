
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { animalService, Animal, CreateAnimalDto } from "@/services/animalService";
import { toast } from "sonner";
import { Plus, Pencil, Trash, Image, ImagePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Schema for animal form
const animalSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  breed: z.string().min(1, "Breed is required"),
  weight: z.number().min(1, "Weight must be at least 1"),
  age: z.string().optional(),
  price: z.number().min(1, "Price must be at least 1"),
  pricePerShare: z.number().min(1, "Price per share must be at least 1"),
  totalShares: z.number().min(1, "Total shares must be at least 1"),
  imageUrl: z.string().url("Must be a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

// Define a new type that matches exactly what animalService.addAnimal expects
type AnimalFormValues = Required<Omit<Animal, 'id' | 'bookedShares' | 'remainingShares' | 'additionalImages' | 'features'>>;

const AnimalManagement = () => {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [selectedImageTab, setSelectedImageTab] = useState("url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const pageSize = 5;

  // Fetch animals with pagination
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["animals", page],
    queryFn: () => animalService.getPaginatedAnimals(page, pageSize),
  });

  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      name: "",
      category: "cow",
      breed: "",
      weight: 0,
      age: "",
      price: 0,
      pricePerShare: 0,
      totalShares: 7,
      imageUrl: "",
      description: "",
    },
  });

  const addAnimalMutation = useMutation({
    mutationFn: (values: CreateAnimalDto) => animalService.addAnimal(values),
    onSuccess: () => {
      toast.success("Animal added successfully");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: () => {
      toast.error("Failed to add animal");
    },
  });

  const updateAnimalMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<Animal> }) => 
      animalService.updateAnimal(id, values),
    onSuccess: () => {
      toast.success("Animal updated successfully");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: () => {
      toast.error("Failed to update animal");
    },
  });

  const deleteAnimalMutation = useMutation({
    mutationFn: (id: string) => animalService.deleteAnimal(id),
    onSuccess: () => {
      toast.success("Animal deleted successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete animal");
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // If we're in the file upload tab, update the form's imageUrl field
      // with a placeholder that will be replaced on submission
      if (selectedImageTab === "upload") {
        form.setValue("imageUrl", "image-being-uploaded");
      }
    }
  };

  const onSubmit = async (values: AnimalFormValues) => {
    try {
      let finalImageUrl = values.imageUrl;
      
      // If we're using file upload and have a file
      if (selectedImageTab === "upload" && imageFile) {
        // In a real application, you would upload the file to a server here
        // and get back a URL. For now, we'll simulate it using the preview URL
        finalImageUrl = imagePreview || values.imageUrl;
        
        // In production, this is where you'd make the API call to upload the image
        console.log("Would upload file:", imageFile.name);
      }
      
      const dataToSubmit = {
        ...values,
        imageUrl: finalImageUrl
      };
      
      if (editingAnimal) {
        updateAnimalMutation.mutate({ id: editingAnimal.id, values: dataToSubmit });
      } else {
        addAnimalMutation.mutate(dataToSubmit);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to process image upload");
    }
  };

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
    form.reset({
      name: animal.name,
      category: animal.category,
      breed: animal.breed,
      weight: animal.weight,
      age: animal.age || "",
      price: animal.price,
      pricePerShare: animal.pricePerShare,
      totalShares: animal.totalShares,
      imageUrl: animal.imageUrl,
      description: animal.description,
    });
    
    // Reset image state
    setImageFile(null);
    setImagePreview(animal.imageUrl);
    setSelectedImageTab("url");
    
    setIsDialogOpen(true);
  };

  const handleDeleteAnimal = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this animal?")) {
      deleteAnimalMutation.mutate(id);
    }
  };

  const resetForm = () => {
    form.reset({
      name: "",
      category: "cow",
      breed: "",
      weight: 0,
      age: "",
      price: 0,
      pricePerShare: 0,
      totalShares: 7,
      imageUrl: "",
      description: "",
    });
    setEditingAnimal(null);
    setImageFile(null);
    setImagePreview(null);
    setSelectedImageTab("url");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const totalPages = data?.totalPages || 1;

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Animal Management</h1>
          <p className="text-muted-foreground">Add, edit, and manage Qurbani animals</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Animal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAnimal ? "Edit Animal" : "Add New Animal"}</DialogTitle>
              <DialogDescription>
                {editingAnimal 
                  ? "Update the details of an existing animal" 
                  : "Fill in the details to add a new animal to your inventory"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Animal Name</Label>
                  <Input id="name" {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    {...form.register("category")}
                  >
                    <option value="cow">Cow</option>
                    <option value="goat">Goat</option>
                    <option value="lamb">Lamb</option>
                    <option value="camel">Camel</option>
                  </select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input id="breed" {...form.register("breed")} />
                  {form.formState.errors.breed && (
                    <p className="text-sm text-red-500">{form.formState.errors.breed.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    {...form.register("weight", { valueAsNumber: true })} 
                  />
                  {form.formState.errors.weight && (
                    <p className="text-sm text-red-500">{form.formState.errors.weight.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age (Optional)</Label>
                  <Input id="age" {...form.register("age")} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Total Price</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    {...form.register("price", { valueAsNumber: true })} 
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pricePerShare">Price Per Share</Label>
                  <Input 
                    id="pricePerShare" 
                    type="number" 
                    {...form.register("pricePerShare", { valueAsNumber: true })} 
                  />
                  {form.formState.errors.pricePerShare && (
                    <p className="text-sm text-red-500">{form.formState.errors.pricePerShare.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalShares">Total Shares</Label>
                  <Input 
                    id="totalShares" 
                    type="number" 
                    {...form.register("totalShares", { valueAsNumber: true })} 
                  />
                  {form.formState.errors.totalShares && (
                    <p className="text-sm text-red-500">{form.formState.errors.totalShares.message}</p>
                  )}
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <Label>Animal Image</Label>
                  <Tabs 
                    defaultValue="url" 
                    value={selectedImageTab}
                    onValueChange={(value) => setSelectedImageTab(value)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url">Image URL</TabsTrigger>
                      <TabsTrigger value="upload">Upload Image</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="space-y-2">
                      <Input 
                        id="imageUrl" 
                        placeholder="https://example.com/image.jpg" 
                        {...form.register("imageUrl")}
                      />
                      {form.formState.errors.imageUrl && (
                        <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
                      )}
                    </TabsContent>
                    <TabsContent value="upload" className="space-y-4">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="picture">Upload Image</Label>
                        <Input
                          id="picture"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                      {imagePreview && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                          <div className="relative h-40 w-full overflow-hidden rounded-md">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2"
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addAnimalMutation.isPending || updateAnimalMutation.isPending}>
                  {editingAnimal 
                    ? updateAnimalMutation.isPending ? "Updating..." : "Update Animal" 
                    : addAnimalMutation.isPending ? "Adding..." : "Add Animal"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Animals</CardTitle>
          <CardDescription>
            Showing {data?.animals.length || 0} of {data?.totalItems || 0} animals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Price/Share</TableHead>
                      <TableHead className="text-right">Available Shares</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.animals.map((animal) => (
                      <TableRow key={animal.id}>
                        <TableCell>
                          <div className="h-10 w-10 overflow-hidden rounded">
                            <img 
                              src={animal.imageUrl} 
                              alt={animal.name} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://placehold.co/100x100?text=No+Image";
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{animal.name}</TableCell>
                        <TableCell className="capitalize">{animal.category}</TableCell>
                        <TableCell>PKR {animal.price.toLocaleString()}</TableCell>
                        <TableCell className="text-right">PKR {animal.pricePerShare.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{animal.remainingShares} / {animal.totalShares}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditAnimal(animal)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteAnimal(animal.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalManagement;

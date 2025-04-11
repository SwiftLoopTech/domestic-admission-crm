"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUpload } from "@/components/colleges/file-upload"
import { PlusIcon, BuildingIcon, MapPinIcon, LinkIcon, FileIcon } from "lucide-react"

interface AddCollegeModalProps {
  onAddCollege: (college: {
    name: string
    location: string
    website: string
    brochureFile: File | null
  }) => void
}

export function AddCollegeModal({ onAddCollege }: AddCollegeModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [brochureFile, setBrochureFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onAddCollege({
      name,
      location,
      website,
      brochureFile
    })
    
    // Reset form and close modal
    setName("")
    setLocation("")
    setWebsite("")
    setBrochureFile(null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add College
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 bg-white border-none">
        <DialogHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 rounded-t-lg">
          <DialogTitle className="text-white flex items-center gap-2">
            <BuildingIcon className="h-5 w-5" />
            Add New College
          </DialogTitle>
          <DialogDescription className="text-teal-50">
            Enter the institution details to add it to the system
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
              <h3 className="text-sm font-medium text-teal-800 mb-3 flex items-center gap-2">
                <BuildingIcon className="h-4 w-4" />
                Institution Details
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">College Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter college name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="City, State"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Online Presence
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input 
                  id="website" 
                  type="url" 
                  value={website} 
                  onChange={(e) => setWebsite(e.target.value)} 
                  placeholder="https://example.edu"
                  required
                />
              </div>
            </div>

            {/* Documents */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
              <h3 className="text-sm font-medium text-orange-800 mb-3 flex items-center gap-2">
                <FileIcon className="h-4 w-4" />
                Documents
              </h3>
              
              <FileUpload 
                onFileChange={setBrochureFile} 
                label="College Brochure" 
                accept=".pdf,.doc,.docx" 
                maxSize={10}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700"
            >
              Add College
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

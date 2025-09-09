"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ResumeBlock {
  id: string;
  type: "summary" | "experience" | "project" | "education" | "skill";
  content: string;
  tags?: string[];
}

interface Resume {
  _id: string;
  name: string;
  blocks: ResumeBlock[];
  createdAt: string;
  updatedAt: string;
}

const blockTypes = [
  { value: "summary", label: "Summary", icon: User, color: "bg-blue-100 text-blue-800" },
  { value: "experience", label: "Experience", icon: Briefcase, color: "bg-green-100 text-green-800" },
  { value: "project", label: "Projects", icon: Code, color: "bg-purple-100 text-purple-800" },
  { value: "education", label: "Education", icon: GraduationCap, color: "bg-yellow-100 text-yellow-800" },
  { value: "skill", label: "Skills", icon: Award, color: "bg-red-100 text-red-800" },
];

export default function ResumesPage() {
  const { data: session, status } = useSession();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ResumeBlock | null>(null);

  // Form states
  const [resumeName, setResumeName] = useState("");
  const [blockType, setBlockType] = useState<ResumeBlock["type"]>("summary");
  const [blockContent, setBlockContent] = useState("");
  const [blockTags, setBlockTags] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchResumes();
    }
  }, [status]);

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      setResumes(data.data || []);
      if (data.data && data.data.length > 0 && !selectedResume) {
        setSelectedResume(data.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: resumeName, blocks: [] }),
      });

      if (res.ok) {
        await fetchResumes();
        setIsAddDialogOpen(false);
        setResumeName("");
      }
    } catch (error) {
      console.error("Failed to create resume:", error);
    }
  };

  const handleAddBlock = async () => {
    if (!selectedResume || !blockContent.trim()) return;

    const newBlock: ResumeBlock = {
      id: Date.now().toString(),
      type: blockType,
      content: blockContent.trim(),
      tags: blockTags ? blockTags.split(",").map(t => t.trim()).filter(Boolean) : [],
    };

    try {
      const updatedBlocks = [...selectedResume.blocks, newBlock];
      const res = await fetch("/api/resumes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedResume._id,
          updates: { blocks: updatedBlocks },
        }),
      });

      if (res.ok) {
        await fetchResumes();
        setSelectedResume({ ...selectedResume, blocks: updatedBlocks });
        setBlockContent("");
        setBlockTags("");
      }
    } catch (error) {
      console.error("Failed to add block:", error);
    }
  };

  const handleUpdateBlock = async () => {
    if (!selectedResume || !editingBlock || !blockContent.trim()) return;

    const updatedBlocks = selectedResume.blocks.map(block =>
      block.id === editingBlock.id
        ? {
            ...block,
            content: blockContent.trim(),
            tags: blockTags ? blockTags.split(",").map(t => t.trim()).filter(Boolean) : [],
          }
        : block
    );

    try {
      const res = await fetch("/api/resumes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedResume._id,
          updates: { blocks: updatedBlocks },
        }),
      });

      if (res.ok) {
        await fetchResumes();
        setSelectedResume({ ...selectedResume, blocks: updatedBlocks });
        setIsEditDialogOpen(false);
        setEditingBlock(null);
        setBlockContent("");
        setBlockTags("");
      }
    } catch (error) {
      console.error("Failed to update block:", error);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!selectedResume) return;

    const updatedBlocks = selectedResume.blocks.filter(block => block.id !== blockId);
    try {
      const res = await fetch("/api/resumes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedResume._id,
          updates: { blocks: updatedBlocks },
        }),
      });

      if (res.ok) {
        await fetchResumes();
        setSelectedResume({ ...selectedResume, blocks: updatedBlocks });
      }
    } catch (error) {
      console.error("Failed to delete block:", error);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      const res = await fetch("/api/resumes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resumeId }),
      });

      if (res.ok) {
        await fetchResumes();
        if (selectedResume?._id === resumeId) {
          setSelectedResume(resumes.length > 1 ? resumes.find(r => r._id !== resumeId) || null : null);
        }
      }
    } catch (error) {
      console.error("Failed to delete resume:", error);
    }
  };

  const openEditDialog = (block: ResumeBlock) => {
    setEditingBlock(block);
    setBlockType(block.type);
    setBlockContent(block.content);
    setBlockTags(block.tags?.join(", ") || "");
    setIsEditDialogOpen(true);
  };

  const getBlockIcon = (type: ResumeBlock["type"]) => {
    const blockType = blockTypes.find(bt => bt.value === type);
    return blockType?.icon || FileText;
  };

  const getBlockColor = (type: ResumeBlock["type"]) => {
    const blockType = blockTypes.find(bt => bt.value === type);
    return blockType?.color || "bg-gray-100 text-gray-800";
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C63FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resumes...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please sign in to view resumes.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6C63FF]/5 via-[#00C9A7]/5 to-[#6C63FF]/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Builder</h1>
            <p className="text-gray-600">Build and customize your professional resume</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#6C63FF] to-[#00C9A7] text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Resume
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Resume</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateResume} className="space-y-4">
                <div>
                  <Label htmlFor="resume-name">Resume Name</Label>
                  <Input
                    id="resume-name"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    placeholder="e.g. Software Engineer Resume"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Resume</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Resume List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  My Resumes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resumes.length === 0 ? (
                  <p className="text-gray-500 text-sm">No resumes yet</p>
                ) : (
                  resumes.map((resume) => (
                    <div
                      key={resume._id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedResume?._id === resume._id
                          ? "bg-[#6C63FF]/10 border border-[#6C63FF]/20"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedResume(resume)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{resume.name}</h3>
                          <p className="text-xs text-gray-500">
                            {resume.blocks.length} sections
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteResume(resume._id);
                          }}
                          className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/resumes/${resume._id}`, "_blank");
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resume Editor */}
          <div className="lg:col-span-3">
            {selectedResume ? (
              <div className="space-y-6">
                {/* Resume Header */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{selectedResume.name}</CardTitle>
                      <div className="text-sm text-gray-500">
                        {selectedResume.blocks.length} sections
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Add New Block */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Section</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="block-type">Section Type</Label>
                        <select
                          id="block-type"
                          value={blockType}
                          onChange={(e) => setBlockType(e.target.value as ResumeBlock["type"])}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                        >
                          {blockTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="block-tags">Tags (comma-separated)</Label>
                        <Input
                          id="block-tags"
                          value={blockTags}
                          onChange={(e) => setBlockTags(e.target.value)}
                          placeholder="e.g. React, JavaScript, Leadership"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="block-content">Content</Label>
                      <Textarea
                        id="block-content"
                        value={blockContent}
                        onChange={(e) => setBlockContent(e.target.value)}
                        placeholder="Enter your content here..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleAddBlock} disabled={!blockContent.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </CardContent>
                </Card>

                {/* Resume Sections */}
                <div className="space-y-4">
                  {selectedResume.blocks.map((block) => {
                    const BlockIcon = getBlockIcon(block.type);
                    const blockType = blockTypes.find(bt => bt.value === block.type);
                    
                    return (
                      <Card key={block.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${getBlockColor(block.type)}`}>
                                <BlockIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{blockType?.label}</h3>
                                {block.tags && block.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {block.tags.map((tag, index) => (
                                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(block)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBlock(block.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="prose max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap">{block.content}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {selectedResume.blocks.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                      <p className="text-gray-500 mb-4">Add your first section to start building your resume</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resume selected</h3>
                  <p className="text-gray-500 mb-4">Create a new resume or select an existing one</p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Resume
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Edit Block Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-block-type">Section Type</Label>
                  <select
                    id="edit-block-type"
                    value={blockType}
                    onChange={(e) => setBlockType(e.target.value as ResumeBlock["type"])}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                  >
                    {blockTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-block-tags">Tags (comma-separated)</Label>
                  <Input
                    id="edit-block-tags"
                    value={blockTags}
                    onChange={(e) => setBlockTags(e.target.value)}
                    placeholder="e.g. React, JavaScript, Leadership"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-block-content">Content</Label>
                <Textarea
                  id="edit-block-content"
                  value={blockContent}
                  onChange={(e) => setBlockContent(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateBlock}>Update Section</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

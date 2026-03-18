import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Search, Filter, Eye, Dna, Activity, AlertTriangle } from "lucide-react";
import type { SyntheticTwin } from "@/types/patient";

interface TwinsTableProps {
  twins: SyntheticTwin[];
  onSelectTwin?: (twin: SyntheticTwin) => void;
}

export function TwinsTable({ twins, onSelectTwin }: TwinsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [selectedTwin, setSelectedTwin] = useState<SyntheticTwin | null>(null);

  const filteredTwins = twins.filter((twin) => {
    const matchesSearch = 
      twin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      twin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      twin.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = genderFilter === "all" || twin.gender.toLowerCase() === genderFilter.toLowerCase();
    
    return matchesSearch && matchesGender;
  });

  const getMatchAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "bg-success text-success-foreground";
    if (accuracy >= 75) return "bg-info text-info-foreground";
    return "bg-warning text-warning-foreground";
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-info" };
    if (bmi < 25) return { label: "Normal", color: "text-success" };
    if (bmi < 30) return { label: "Overweight", color: "text-warning" };
    return { label: "Obese", color: "text-destructive" };
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Synthetic Twins</CardTitle>
              <CardDescription>
                {twins.length} digital patient twins generated
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search twins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px] pl-9"
              />
            </div>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Demographics</TableHead>
                <TableHead>Physical</TableHead>
                <TableHead>Blood</TableHead>
                <TableHead className="text-center">Match</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTwins.map((twin, index) => {
                const bmiCategory = getBMICategory(twin.bmi || 0);
                return (
                  <TableRow 
                    key={twin.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <TableCell className="font-mono text-sm font-medium text-primary">
                      {twin.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{twin.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {twin.gender}, {twin.age} years
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{twin.country}</div>
                        <div className="text-muted-foreground">{twin.ethnicity}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{twin.height}cm / {twin.weight}kg</div>
                        <div className={bmiCategory.color}>
                          BMI {twin.bmi?.toFixed(1)} ({bmiCategory.label})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {twin.bloodGroup}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getMatchAccuracyColor(twin.matchAccuracy)}>
                        {twin.matchAccuracy}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedTwin(twin)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Dna className="h-5 w-5 text-primary" />
                              Twin Details: {twin.id}
                            </DialogTitle>
                            <DialogDescription>
                              Complete profile for synthetic patient {twin.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground">Name</div>
                                <div className="font-medium">{twin.name}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Age & Gender</div>
                                <div className="font-medium">{twin.age} years, {twin.gender}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Height</div>
                                <div className="font-medium">{twin.height} cm</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Weight</div>
                                <div className="font-medium">{twin.weight} kg</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">BMI</div>
                                <div className={`font-medium ${bmiCategory.color}`}>
                                  {twin.bmi?.toFixed(1)} ({bmiCategory.label})
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Blood Group</div>
                                <div className="font-medium">{twin.bloodGroup}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Country</div>
                                <div className="font-medium">{twin.country}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Ethnicity</div>
                                <div className="font-medium">{twin.ethnicity}</div>
                              </div>
                            </div>
                            
                            <div className="border-t pt-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Activity className="h-4 w-4" /> Biological Markers
                              </div>
                              <p className="text-sm">{twin.biologicalMarkers || "No additional markers specified"}</p>
                            </div>
                            
                            {twin.riskFactors && twin.riskFactors.length > 0 && (
                              <div className="border-t pt-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <AlertTriangle className="h-4 w-4" /> Risk Factors
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {twin.riskFactors.map((factor, i) => (
                                    <Badge key={i} variant="secondary">{factor}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between border-t pt-4">
                              <span className="text-sm text-muted-foreground">Match Accuracy</span>
                              <Badge className={getMatchAccuracyColor(twin.matchAccuracy)}>
                                {twin.matchAccuracy}% Match
                              </Badge>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {filteredTwins.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No twins match your search criteria
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { IconFolder, IconExternalLink } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const projects = [
  {
    name: "AI Research Portal",
    description: "A centralized platform for submitting, reviewing, and publishing AI research.",
    link: "https://example.com/ai-research",
  },
  {
    name: "BioGuardian",
    description: "An AI-powered platform to monitor biodiversity using computer vision and satellite data.",
    link: "https://example.com/bioguardian",
  },
  {
    name: "FitQuest",
    description: "A gamified fitness app where real workouts unlock game levels and rewards.",
    link: "https://example.com/fitquest",
  },
  {
    name: "GrietGo",
    description: "A social media site for students to share posts, follow others, and join communities.",
    link: "https://example.com/grietgo",
  },
]

export function Projects() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.name} className="@container/card h-full flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center gap-3">
            <IconFolder className="text-primary size-6" />
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button variant="outline" asChild>
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                View Project <IconExternalLink className="ml-2 size-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

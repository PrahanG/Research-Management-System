import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TeamMember {
  name: string
  role: string
  avatarUrl?: string
}

interface ResearchTeam {
  lead: TeamMember
  members: TeamMember[]
  project: string
  department: string
}

const teams: ResearchTeam[] = [
  {
    lead: {
      name: "Dr. Ayesha Kapoor",
      role: "Principal Investigator",
      avatarUrl: "/faculty1.jpg",
    },
    project: "AI for Climate Prediction",
    department: "Computer Science",
    members: [
      { name: "Rahul Verma", role: "PhD Scholar" },
      { name: "Nikita Das", role: "Research Intern" },
    ],
  },
  {
    lead: {
      name: "Prof. Rohan Mehta",
      role: "Lead Scientist",
      avatarUrl: "/faculty2.jpg",
    },
    project: "BioGuardian – Biodiversity Surveillance",
    department: "Biotech & Environment",
    members: [
      { name: "Meera Iyer", role: "Co-Researcher" },
      { name: "Arjun S.", role: "Research Assistant" },
    ],
  },
]

export function Teams() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 xl:grid-cols-3">
      {teams.map((team, idx) => (
        <Card key={idx} className="h-full">
          <CardHeader className="flex items-start justify-between space-y-0">
            <div>
              <CardTitle>{team.project}</CardTitle>
              <CardDescription>{team.department}</CardDescription>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={team.lead.avatarUrl} />
              <AvatarFallback>
                {team.lead.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <p className="font-medium text-foreground">Team Lead:</p>
              <span className="text-sm text-muted-foreground">
                {team.lead.name} ({team.lead.role})
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">Members:</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {team.members.map((member, i) => (
                  <Badge key={i} variant="outline">
                    {member.name} – {member.role}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

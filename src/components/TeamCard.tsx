import { TeamProfile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/Tag";
import { CalendarDays, Rocket, AtSign, Mail, Gamepad2, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TeamCard({ team }: { team: TeamProfile }) {
  const getIcon = () => {
    switch (team.contactType) {
      case "Instagram": return <AtSign className="w-5 h-5 text-pink-500" />;
      case "E-posta": return <Mail className="w-5 h-5 text-blue-500" />;
      case "Discord": return <Gamepad2 className="w-5 h-5 text-indigo-500" />;
      default: return <Target className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col h-full border border-purple-500/20 shadow-xl bg-card rounded-3xl p-6 gap-4 hover:shadow-purple-500/10 transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-2xl text-purple-600 line-clamp-1">{team.teamName}</h3>
          <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
            <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
              <Rocket className="w-3 h-3" /> {team.projectStage}
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground flex-1 line-clamp-3">
        {team.bio}
      </p>

      {team.skills && team.skills.length > 0 && (
        <div className="space-y-1.5 mt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kullanılan Teknolojiler</p>
          <div className="flex flex-wrap gap-1.5">
            {team.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="font-normal text-xs">{skill}</Badge>
            ))}
            {team.skills.length > 3 && (
              <Badge variant="outline" className="font-normal text-xs">+{team.skills.length - 3}</Badge>
            )}
          </div>
        </div>
      )}

      {team.lookingFor.length > 0 && (
        <div className="mt-2 p-3 bg-purple-50 rounded-xl space-y-2 border border-purple-100">
           <p className="text-xs font-semibold text-purple-800 flex items-center gap-1"><Target className="w-3 h-3" /> Aranılan Roller</p>
           <div className="flex flex-wrap gap-1.5">
            {team.lookingFor.slice(0, 3).map((role) => (
              <Tag key={role} text={role} variant="primary" />
            ))}
           </div>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-border/40 flex justify-between items-center bg-muted/20 -mx-6 -mb-6 p-6 rounded-b-3xl">
        <div className="flex items-center text-xs text-muted-foreground font-medium gap-1">
          <CalendarDays className="w-3.5 h-3.5" />
          {team.createdAt ? new Date(team.createdAt.seconds * 1000).toLocaleDateString("tr-TR") : "Yeni"}
        </div>
        <div className="flex items-center gap-2 group cursor-pointer bg-background border px-3 py-1.5 rounded-full hover:bg-muted transition-colors">
          {getIcon()}
          <span className="text-sm font-semibold group-hover:text-foreground">{team.contactValue}</span>
        </div>
      </div>
      <div className="mt-4 border-t pt-4">
        <Link href={`/profile/${team.username || team.id}`} passHref className="w-full">
           <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">İlanı İncele</Button>
        </Link>
      </div>
    </div>
  );
}

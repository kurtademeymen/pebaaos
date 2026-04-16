import { PersonalProfile } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tag } from "./Tag";
import { Mail, AtSign, Gamepad2, Link2 } from "lucide-react";
import { HoverCard } from "@/components/MotionWrappers";

interface UserCardProps {
  user: PersonalProfile;
}

const getContactIcon = (type: string) => {
  switch (type) {
    case "Instagram":
      return <AtSign className="w-4 h-4 mr-2" />;
    case "E-posta":
      return <Mail className="w-4 h-4 mr-2" />;
    case "Discord":
      return <Gamepad2 className="w-4 h-4 mr-2" />;
    default:
      return <Link2 className="w-4 h-4 mr-2" />;
  }
};

export function UserCard({ user }: UserCardProps) {
  return (
    <HoverCard className="h-full">
      <Card className="flex flex-col h-full border-border/40 shadow-sm hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold truncate pr-2" title={user.displayName}>
              {user.displayName}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="font-normal bg-secondary/50">
                {user.grade}. Sınıf {user.grade === "Mezun" && ""}
              </Badge>
              {user.isActivelyLooking && (
                <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 font-medium">
                  Aktif Ekip Arıyor
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-foreground/80 line-clamp-2 mb-4">
          {user.bio}
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
              Öne Çıkan Yetenekler
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {user.skills.slice(0, 4).map((skill, i) => (
                <Tag key={i} text={skill} variant="primary" />
              ))}
              {user.skills.length > 4 && (
                <Tag text={`+${user.skills.length - 4}`} variant="outline" />
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
              İlgi Alanları
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {user.interests.slice(0, 3).map((interest, i) => (
                <Tag key={i} text={interest} variant="secondary" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-border/40 mt-auto flex justify-between items-center bg-muted/20">
        <div className="text-xs text-muted-foreground font-medium flex items-center">
          {getContactIcon(user.contactType)}
          {user.contactValue.length > 15 ? user.contactValue.substring(0, 15) + "..." : user.contactValue}
        </div>
        <Link href={`/profile/${user.username || user.id}`} passHref>
          <Button variant="ghost" size="sm" className="font-semibold text-primary hover:text-primary hover:bg-primary/10">
            Profili Gör
          </Button>
        </Link>
      </CardFooter>
    </Card>
  </HoverCard>
  );
}

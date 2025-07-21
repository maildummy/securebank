import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Comprehensive list of countries with flags
const countries = [
  { value: "af", label: "Afghanistan", flag: "🇦🇫" },
  { value: "al", label: "Albania", flag: "🇦🇱" },
  { value: "dz", label: "Algeria", flag: "🇩🇿" },
  { value: "as", label: "American Samoa", flag: "🇦🇸" },
  { value: "ad", label: "Andorra", flag: "🇦🇩" },
  { value: "ao", label: "Angola", flag: "🇦🇴" },
  { value: "ai", label: "Anguilla", flag: "🇦🇮" },
  { value: "ag", label: "Antigua and Barbuda", flag: "🇦🇬" },
  { value: "ar", label: "Argentina", flag: "🇦🇷" },
  { value: "am", label: "Armenia", flag: "🇦🇲" },
  { value: "aw", label: "Aruba", flag: "🇦🇼" },
  { value: "au", label: "Australia", flag: "🇦🇺" },
  { value: "at", label: "Austria", flag: "🇦🇹" },
  { value: "az", label: "Azerbaijan", flag: "🇦🇿" },
  { value: "bs", label: "Bahamas", flag: "🇧🇸" },
  { value: "bh", label: "Bahrain", flag: "🇧🇭" },
  { value: "bd", label: "Bangladesh", flag: "🇧🇩" },
  { value: "bb", label: "Barbados", flag: "🇧🇧" },
  { value: "by", label: "Belarus", flag: "🇧🇾" },
  { value: "be", label: "Belgium", flag: "🇧🇪" },
  { value: "bz", label: "Belize", flag: "🇧🇿" },
  { value: "bj", label: "Benin", flag: "🇧🇯" },
  { value: "bm", label: "Bermuda", flag: "🇧🇲" },
  { value: "bt", label: "Bhutan", flag: "🇧🇹" },
  { value: "bo", label: "Bolivia", flag: "🇧🇴" },
  { value: "ba", label: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { value: "bw", label: "Botswana", flag: "🇧🇼" },
  { value: "br", label: "Brazil", flag: "🇧🇷" },
  { value: "io", label: "British Indian Ocean Territory", flag: "🇮🇴" },
  { value: "bn", label: "Brunei", flag: "🇧🇳" },
  { value: "bg", label: "Bulgaria", flag: "🇧🇬" },
  { value: "bf", label: "Burkina Faso", flag: "🇧🇫" },
  { value: "bi", label: "Burundi", flag: "🇧🇮" },
  { value: "kh", label: "Cambodia", flag: "🇰🇭" },
  { value: "cm", label: "Cameroon", flag: "🇨🇲" },
  { value: "ca", label: "Canada", flag: "🇨🇦" },
  { value: "cv", label: "Cape Verde", flag: "🇨🇻" },
  { value: "ky", label: "Cayman Islands", flag: "🇰🇾" },
  { value: "cf", label: "Central African Republic", flag: "🇨🇫" },
  { value: "td", label: "Chad", flag: "🇹🇩" },
  { value: "cl", label: "Chile", flag: "🇨🇱" },
  { value: "cn", label: "China", flag: "🇨🇳" },
  { value: "co", label: "Colombia", flag: "🇨🇴" },
  { value: "km", label: "Comoros", flag: "🇰🇲" },
  { value: "cg", label: "Congo", flag: "🇨🇬" },
  { value: "cd", label: "Congo, Democratic Republic", flag: "🇨🇩" },
  { value: "ck", label: "Cook Islands", flag: "🇨🇰" },
  { value: "cr", label: "Costa Rica", flag: "🇨🇷" },
  { value: "hr", label: "Croatia", flag: "🇭🇷" },
  { value: "cu", label: "Cuba", flag: "🇨🇺" },
  { value: "cy", label: "Cyprus", flag: "🇨🇾" },
  { value: "cz", label: "Czech Republic", flag: "🇨🇿" },
  { value: "dk", label: "Denmark", flag: "🇩🇰" },
  { value: "dj", label: "Djibouti", flag: "🇩🇯" },
  { value: "dm", label: "Dominica", flag: "🇩🇲" },
  { value: "do", label: "Dominican Republic", flag: "🇩🇴" },
  { value: "ec", label: "Ecuador", flag: "🇪🇨" },
  { value: "eg", label: "Egypt", flag: "🇪🇬" },
  { value: "sv", label: "El Salvador", flag: "🇸🇻" },
  { value: "gq", label: "Equatorial Guinea", flag: "🇬🇶" },
  { value: "er", label: "Eritrea", flag: "🇪🇷" },
  { value: "ee", label: "Estonia", flag: "🇪🇪" },
  { value: "et", label: "Ethiopia", flag: "🇪🇹" },
  { value: "fk", label: "Falkland Islands", flag: "🇫🇰" },
  { value: "fo", label: "Faroe Islands", flag: "🇫🇴" },
  { value: "fj", label: "Fiji", flag: "🇫🇯" },
  { value: "fi", label: "Finland", flag: "🇫🇮" },
  { value: "fr", label: "France", flag: "🇫🇷" },
  { value: "gf", label: "French Guiana", flag: "🇬🇫" },
  { value: "pf", label: "French Polynesia", flag: "🇵🇫" },
  { value: "ga", label: "Gabon", flag: "🇬🇦" },
  { value: "gm", label: "Gambia", flag: "🇬🇲" },
  { value: "ge", label: "Georgia", flag: "🇬🇪" },
  { value: "de", label: "Germany", flag: "🇩🇪" },
  { value: "gh", label: "Ghana", flag: "🇬🇭" },
  { value: "gi", label: "Gibraltar", flag: "🇬🇮" },
  { value: "gr", label: "Greece", flag: "🇬🇷" },
  { value: "gl", label: "Greenland", flag: "🇬🇱" },
  { value: "gd", label: "Grenada", flag: "🇬🇩" },
  { value: "gp", label: "Guadeloupe", flag: "🇬🇵" },
  { value: "gu", label: "Guam", flag: "🇬🇺" },
  { value: "gt", label: "Guatemala", flag: "🇬🇹" },
  { value: "gn", label: "Guinea", flag: "🇬🇳" },
  { value: "gw", label: "Guinea-Bissau", flag: "🇬🇼" },
  { value: "gy", label: "Guyana", flag: "🇬🇾" },
  { value: "ht", label: "Haiti", flag: "🇭🇹" },
  { value: "hn", label: "Honduras", flag: "🇭🇳" },
  { value: "hk", label: "Hong Kong", flag: "🇭🇰" },
  { value: "hu", label: "Hungary", flag: "🇭🇺" },
  { value: "is", label: "Iceland", flag: "🇮🇸" },
  { value: "in", label: "India", flag: "🇮🇳" },
  { value: "id", label: "Indonesia", flag: "🇮🇩" },
  { value: "ir", label: "Iran", flag: "🇮🇷" },
  { value: "iq", label: "Iraq", flag: "🇮🇶" },
  { value: "ie", label: "Ireland", flag: "🇮🇪" },
  { value: "il", label: "Israel", flag: "🇮🇱" },
  { value: "it", label: "Italy", flag: "🇮🇹" },
  { value: "jm", label: "Jamaica", flag: "🇯🇲" },
  { value: "jp", label: "Japan", flag: "🇯🇵" },
  { value: "jo", label: "Jordan", flag: "🇯🇴" },
  { value: "kz", label: "Kazakhstan", flag: "🇰🇿" },
  { value: "ke", label: "Kenya", flag: "🇰🇪" },
  { value: "ki", label: "Kiribati", flag: "🇰🇮" },
  { value: "kp", label: "Korea, North", flag: "🇰🇵" },
  { value: "kr", label: "Korea, South", flag: "🇰🇷" },
  { value: "kw", label: "Kuwait", flag: "🇰🇼" },
  { value: "kg", label: "Kyrgyzstan", flag: "🇰🇬" },
  { value: "la", label: "Laos", flag: "🇱🇦" },
  { value: "lv", label: "Latvia", flag: "🇱🇻" },
  { value: "lb", label: "Lebanon", flag: "🇱🇧" },
  { value: "ls", label: "Lesotho", flag: "🇱🇸" },
  { value: "lr", label: "Liberia", flag: "🇱🇷" },
  { value: "ly", label: "Libya", flag: "🇱🇾" },
  { value: "li", label: "Liechtenstein", flag: "🇱🇮" },
  { value: "lt", label: "Lithuania", flag: "🇱🇹" },
  { value: "lu", label: "Luxembourg", flag: "🇱🇺" },
  { value: "mo", label: "Macao", flag: "🇲🇴" },
  { value: "mk", label: "Macedonia", flag: "🇲🇰" },
  { value: "mg", label: "Madagascar", flag: "🇲🇬" },
  { value: "mw", label: "Malawi", flag: "🇲🇼" },
  { value: "my", label: "Malaysia", flag: "🇲🇾" },
  { value: "mv", label: "Maldives", flag: "🇲🇻" },
  { value: "ml", label: "Mali", flag: "🇲🇱" },
  { value: "mt", label: "Malta", flag: "🇲🇹" },
  { value: "mh", label: "Marshall Islands", flag: "🇲🇭" },
  { value: "mq", label: "Martinique", flag: "🇲🇶" },
  { value: "mr", label: "Mauritania", flag: "🇲🇷" },
  { value: "mu", label: "Mauritius", flag: "🇲🇺" },
  { value: "mx", label: "Mexico", flag: "🇲🇽" },
  { value: "fm", label: "Micronesia", flag: "🇫🇲" },
  { value: "md", label: "Moldova", flag: "🇲🇩" },
  { value: "mc", label: "Monaco", flag: "🇲🇨" },
  { value: "mn", label: "Mongolia", flag: "🇲🇳" },
  { value: "me", label: "Montenegro", flag: "🇲🇪" },
  { value: "ms", label: "Montserrat", flag: "🇲🇸" },
  { value: "ma", label: "Morocco", flag: "🇲🇦" },
  { value: "mz", label: "Mozambique", flag: "🇲🇿" },
  { value: "mm", label: "Myanmar", flag: "🇲🇲" },
  { value: "na", label: "Namibia", flag: "🇳🇦" },
  { value: "nr", label: "Nauru", flag: "🇳🇷" },
  { value: "np", label: "Nepal", flag: "🇳🇵" },
  { value: "nl", label: "Netherlands", flag: "🇳🇱" },
  { value: "nc", label: "New Caledonia", flag: "🇳🇨" },
  { value: "nz", label: "New Zealand", flag: "🇳🇿" },
  { value: "ni", label: "Nicaragua", flag: "🇳🇮" },
  { value: "ne", label: "Niger", flag: "🇳🇪" },
  { value: "ng", label: "Nigeria", flag: "🇳🇬" },
  { value: "nu", label: "Niue", flag: "🇳🇺" },
  { value: "nf", label: "Norfolk Island", flag: "🇳🇫" },
  { value: "no", label: "Norway", flag: "🇳🇴" },
  { value: "om", label: "Oman", flag: "🇴🇲" },
  { value: "pk", label: "Pakistan", flag: "🇵🇰" },
  { value: "pw", label: "Palau", flag: "🇵🇼" },
  { value: "ps", label: "Palestine", flag: "🇵🇸" },
  { value: "pa", label: "Panama", flag: "🇵🇦" },
  { value: "pg", label: "Papua New Guinea", flag: "🇵🇬" },
  { value: "py", label: "Paraguay", flag: "🇵🇾" },
  { value: "pe", label: "Peru", flag: "🇵🇪" },
  { value: "ph", label: "Philippines", flag: "🇵🇭" },
  { value: "pl", label: "Poland", flag: "🇵🇱" },
  { value: "pt", label: "Portugal", flag: "🇵🇹" },
  { value: "pr", label: "Puerto Rico", flag: "🇵🇷" },
  { value: "qa", label: "Qatar", flag: "🇶🇦" },
  { value: "re", label: "Reunion", flag: "🇷🇪" },
  { value: "ro", label: "Romania", flag: "🇷🇴" },
  { value: "ru", label: "Russia", flag: "🇷🇺" },
  { value: "rw", label: "Rwanda", flag: "🇷🇼" },
  { value: "kn", label: "Saint Kitts and Nevis", flag: "🇰🇳" },
  { value: "lc", label: "Saint Lucia", flag: "🇱🇨" },
  { value: "vc", label: "Saint Vincent", flag: "🇻🇨" },
  { value: "ws", label: "Samoa", flag: "🇼🇸" },
  { value: "sm", label: "San Marino", flag: "🇸🇲" },
  { value: "st", label: "Sao Tome and Principe", flag: "🇸🇹" },
  { value: "sa", label: "Saudi Arabia", flag: "🇸🇦" },
  { value: "sn", label: "Senegal", flag: "🇸🇳" },
  { value: "rs", label: "Serbia", flag: "🇷🇸" },
  { value: "sc", label: "Seychelles", flag: "🇸🇨" },
  { value: "sl", label: "Sierra Leone", flag: "🇸🇱" },
  { value: "sg", label: "Singapore", flag: "🇸🇬" },
  { value: "sk", label: "Slovakia", flag: "🇸🇰" },
  { value: "si", label: "Slovenia", flag: "🇸🇮" },
  { value: "sb", label: "Solomon Islands", flag: "🇸🇧" },
  { value: "so", label: "Somalia", flag: "🇸🇴" },
  { value: "za", label: "South Africa", flag: "🇿🇦" },
  { value: "ss", label: "South Sudan", flag: "🇸🇸" },
  { value: "es", label: "Spain", flag: "🇪🇸" },
  { value: "lk", label: "Sri Lanka", flag: "🇱🇰" },
  { value: "sd", label: "Sudan", flag: "🇸🇩" },
  { value: "sr", label: "Suriname", flag: "🇸🇷" },
  { value: "sz", label: "Swaziland", flag: "🇸🇿" },
  { value: "se", label: "Sweden", flag: "🇸🇪" },
  { value: "ch", label: "Switzerland", flag: "🇨🇭" },
  { value: "sy", label: "Syria", flag: "🇸🇾" },
  { value: "tw", label: "Taiwan", flag: "🇹🇼" },
  { value: "tj", label: "Tajikistan", flag: "🇹🇯" },
  { value: "tz", label: "Tanzania", flag: "🇹🇿" },
  { value: "th", label: "Thailand", flag: "🇹🇭" },
  { value: "tl", label: "Timor-Leste", flag: "🇹🇱" },
  { value: "tg", label: "Togo", flag: "🇹🇬" },
  { value: "to", label: "Tonga", flag: "🇹🇴" },
  { value: "tt", label: "Trinidad and Tobago", flag: "🇹🇹" },
  { value: "tn", label: "Tunisia", flag: "🇹🇳" },
  { value: "tr", label: "Turkey", flag: "🇹🇷" },
  { value: "tm", label: "Turkmenistan", flag: "🇹🇲" },
  { value: "tv", label: "Tuvalu", flag: "🇹🇻" },
  { value: "ug", label: "Uganda", flag: "🇺🇬" },
  { value: "ua", label: "Ukraine", flag: "🇺🇦" },
  { value: "ae", label: "United Arab Emirates", flag: "🇦🇪" },
  { value: "gb", label: "United Kingdom", flag: "🇬🇧" },
  { value: "us", label: "United States", flag: "🇺🇸" },
  { value: "uy", label: "Uruguay", flag: "🇺🇾" },
  { value: "uz", label: "Uzbekistan", flag: "🇺🇿" },
  { value: "vu", label: "Vanuatu", flag: "🇻🇺" },
  { value: "va", label: "Vatican City", flag: "🇻🇦" },
  { value: "ve", label: "Venezuela", flag: "🇻🇪" },
  { value: "vn", label: "Vietnam", flag: "🇻🇳" },
  { value: "vi", label: "Virgin Islands, U.S.", flag: "🇻🇮" },
  { value: "ye", label: "Yemen", flag: "🇾🇪" },
  { value: "zm", label: "Zambia", flag: "🇿🇲" },
  { value: "zw", label: "Zimbabwe", flag: "🇿🇼" },
];

interface CountryDropdownProps {
  onSelect: (country: string) => void;
  value?: string;
  className?: string;
}

export default function CountryDropdown({ onSelect, value = "United States", className }: CountryDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedCountry = countries.find((country) => country.label === value) || countries.find(country => country.label === "United States");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal text-left", className)}
        >
          {selectedCountry ? (
            <div className="flex items-center">
              <span className="mr-2">{selectedCountry.flag}</span>
              <span>{selectedCountry.label}</span>
            </div>
          ) : (
            "Select country"
          )}
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {countries.map((country) => (
              <CommandItem
                key={country.value}
                value={country.label}
                onSelect={() => {
                  onSelect(country.label);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === country.label ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="mr-2">{country.flag}</span>
                <span>{country.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 
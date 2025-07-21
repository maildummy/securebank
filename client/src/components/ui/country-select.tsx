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
import { Input } from "@/components/ui/input";

// Comprehensive list of countries with codes and flags
const countries = [
  { value: "af", label: "Afghanistan", code: "+93", flag: "🇦🇫" },
  { value: "al", label: "Albania", code: "+355", flag: "🇦🇱" },
  { value: "dz", label: "Algeria", code: "+213", flag: "🇩🇿" },
  { value: "as", label: "American Samoa", code: "+1684", flag: "🇦🇸" },
  { value: "ad", label: "Andorra", code: "+376", flag: "🇦🇩" },
  { value: "ao", label: "Angola", code: "+244", flag: "🇦🇴" },
  { value: "ai", label: "Anguilla", code: "+1264", flag: "🇦🇮" },
  { value: "ag", label: "Antigua and Barbuda", code: "+1268", flag: "🇦🇬" },
  { value: "ar", label: "Argentina", code: "+54", flag: "🇦🇷" },
  { value: "am", label: "Armenia", code: "+374", flag: "🇦🇲" },
  { value: "aw", label: "Aruba", code: "+297", flag: "🇦🇼" },
  { value: "au", label: "Australia", code: "+61", flag: "🇦🇺" },
  { value: "at", label: "Austria", code: "+43", flag: "🇦🇹" },
  { value: "az", label: "Azerbaijan", code: "+994", flag: "🇦🇿" },
  { value: "bs", label: "Bahamas", code: "+1242", flag: "🇧🇸" },
  { value: "bh", label: "Bahrain", code: "+973", flag: "🇧🇭" },
  { value: "bd", label: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { value: "bb", label: "Barbados", code: "+1246", flag: "🇧🇧" },
  { value: "by", label: "Belarus", code: "+375", flag: "🇧🇾" },
  { value: "be", label: "Belgium", code: "+32", flag: "🇧🇪" },
  { value: "bz", label: "Belize", code: "+501", flag: "🇧🇿" },
  { value: "bj", label: "Benin", code: "+229", flag: "🇧🇯" },
  { value: "bm", label: "Bermuda", code: "+1441", flag: "🇧🇲" },
  { value: "bt", label: "Bhutan", code: "+975", flag: "🇧🇹" },
  { value: "bo", label: "Bolivia", code: "+591", flag: "🇧🇴" },
  { value: "ba", label: "Bosnia and Herzegovina", code: "+387", flag: "🇧🇦" },
  { value: "bw", label: "Botswana", code: "+267", flag: "🇧🇼" },
  { value: "br", label: "Brazil", code: "+55", flag: "🇧🇷" },
  { value: "io", label: "British Indian Ocean Territory", code: "+246", flag: "🇮🇴" },
  { value: "bn", label: "Brunei", code: "+673", flag: "🇧🇳" },
  { value: "bg", label: "Bulgaria", code: "+359", flag: "🇧🇬" },
  { value: "bf", label: "Burkina Faso", code: "+226", flag: "🇧🇫" },
  { value: "bi", label: "Burundi", code: "+257", flag: "🇧🇮" },
  { value: "kh", label: "Cambodia", code: "+855", flag: "🇰🇭" },
  { value: "cm", label: "Cameroon", code: "+237", flag: "🇨🇲" },
  { value: "ca", label: "Canada", code: "+1", flag: "🇨🇦" },
  { value: "cv", label: "Cape Verde", code: "+238", flag: "🇨🇻" },
  { value: "ky", label: "Cayman Islands", code: "+1345", flag: "🇰🇾" },
  { value: "cf", label: "Central African Republic", code: "+236", flag: "🇨🇫" },
  { value: "td", label: "Chad", code: "+235", flag: "🇹🇩" },
  { value: "cl", label: "Chile", code: "+56", flag: "🇨🇱" },
  { value: "cn", label: "China", code: "+86", flag: "🇨🇳" },
  { value: "co", label: "Colombia", code: "+57", flag: "🇨🇴" },
  { value: "km", label: "Comoros", code: "+269", flag: "🇰🇲" },
  { value: "cg", label: "Congo", code: "+242", flag: "🇨🇬" },
  { value: "cd", label: "Congo, Democratic Republic", code: "+243", flag: "🇨🇩" },
  { value: "ck", label: "Cook Islands", code: "+682", flag: "🇨🇰" },
  { value: "cr", label: "Costa Rica", code: "+506", flag: "🇨🇷" },
  { value: "hr", label: "Croatia", code: "+385", flag: "🇭🇷" },
  { value: "cu", label: "Cuba", code: "+53", flag: "🇨🇺" },
  { value: "cy", label: "Cyprus", code: "+357", flag: "🇨🇾" },
  { value: "cz", label: "Czech Republic", code: "+420", flag: "🇨🇿" },
  { value: "dk", label: "Denmark", code: "+45", flag: "🇩🇰" },
  { value: "dj", label: "Djibouti", code: "+253", flag: "🇩🇯" },
  { value: "dm", label: "Dominica", code: "+1767", flag: "🇩🇲" },
  { value: "do", label: "Dominican Republic", code: "+1", flag: "🇩🇴" },
  { value: "ec", label: "Ecuador", code: "+593", flag: "🇪🇨" },
  { value: "eg", label: "Egypt", code: "+20", flag: "🇪🇬" },
  { value: "sv", label: "El Salvador", code: "+503", flag: "🇸🇻" },
  { value: "gq", label: "Equatorial Guinea", code: "+240", flag: "🇬🇶" },
  { value: "er", label: "Eritrea", code: "+291", flag: "🇪🇷" },
  { value: "ee", label: "Estonia", code: "+372", flag: "🇪🇪" },
  { value: "et", label: "Ethiopia", code: "+251", flag: "🇪🇹" },
  { value: "fk", label: "Falkland Islands", code: "+500", flag: "🇫🇰" },
  { value: "fo", label: "Faroe Islands", code: "+298", flag: "🇫🇴" },
  { value: "fj", label: "Fiji", code: "+679", flag: "🇫🇯" },
  { value: "fi", label: "Finland", code: "+358", flag: "🇫🇮" },
  { value: "fr", label: "France", code: "+33", flag: "🇫🇷" },
  { value: "gf", label: "French Guiana", code: "+594", flag: "🇬🇫" },
  { value: "pf", label: "French Polynesia", code: "+689", flag: "🇵🇫" },
  { value: "ga", label: "Gabon", code: "+241", flag: "🇬🇦" },
  { value: "gm", label: "Gambia", code: "+220", flag: "🇬🇲" },
  { value: "ge", label: "Georgia", code: "+995", flag: "🇬🇪" },
  { value: "de", label: "Germany", code: "+49", flag: "🇩🇪" },
  { value: "gh", label: "Ghana", code: "+233", flag: "🇬🇭" },
  { value: "gi", label: "Gibraltar", code: "+350", flag: "🇬🇮" },
  { value: "gr", label: "Greece", code: "+30", flag: "🇬🇷" },
  { value: "gl", label: "Greenland", code: "+299", flag: "🇬🇱" },
  { value: "gd", label: "Grenada", code: "+1473", flag: "🇬🇩" },
  { value: "gp", label: "Guadeloupe", code: "+590", flag: "🇬🇵" },
  { value: "gu", label: "Guam", code: "+1671", flag: "🇬🇺" },
  { value: "gt", label: "Guatemala", code: "+502", flag: "🇬🇹" },
  { value: "gn", label: "Guinea", code: "+224", flag: "🇬🇳" },
  { value: "gw", label: "Guinea-Bissau", code: "+245", flag: "🇬🇼" },
  { value: "gy", label: "Guyana", code: "+592", flag: "🇬🇾" },
  { value: "ht", label: "Haiti", code: "+509", flag: "🇭🇹" },
  { value: "hn", label: "Honduras", code: "+504", flag: "🇭🇳" },
  { value: "hk", label: "Hong Kong", code: "+852", flag: "🇭🇰" },
  { value: "hu", label: "Hungary", code: "+36", flag: "🇭🇺" },
  { value: "is", label: "Iceland", code: "+354", flag: "🇮🇸" },
  { value: "in", label: "India", code: "+91", flag: "🇮🇳" },
  { value: "id", label: "Indonesia", code: "+62", flag: "🇮🇩" },
  { value: "ir", label: "Iran", code: "+98", flag: "🇮🇷" },
  { value: "iq", label: "Iraq", code: "+964", flag: "🇮🇶" },
  { value: "ie", label: "Ireland", code: "+353", flag: "🇮🇪" },
  { value: "il", label: "Israel", code: "+972", flag: "🇮🇱" },
  { value: "it", label: "Italy", code: "+39", flag: "🇮🇹" },
  { value: "jm", label: "Jamaica", code: "+1876", flag: "🇯🇲" },
  { value: "jp", label: "Japan", code: "+81", flag: "🇯🇵" },
  { value: "jo", label: "Jordan", code: "+962", flag: "🇯🇴" },
  { value: "kz", label: "Kazakhstan", code: "+7", flag: "🇰🇿" },
  { value: "ke", label: "Kenya", code: "+254", flag: "🇰🇪" },
  { value: "ki", label: "Kiribati", code: "+686", flag: "🇰🇮" },
  { value: "kp", label: "Korea, North", code: "+850", flag: "🇰🇵" },
  { value: "kr", label: "Korea, South", code: "+82", flag: "🇰🇷" },
  { value: "kw", label: "Kuwait", code: "+965", flag: "🇰🇼" },
  { value: "kg", label: "Kyrgyzstan", code: "+996", flag: "🇰🇬" },
  { value: "la", label: "Laos", code: "+856", flag: "🇱🇦" },
  { value: "lv", label: "Latvia", code: "+371", flag: "🇱🇻" },
  { value: "lb", label: "Lebanon", code: "+961", flag: "🇱🇧" },
  { value: "ls", label: "Lesotho", code: "+266", flag: "🇱🇸" },
  { value: "lr", label: "Liberia", code: "+231", flag: "🇱🇷" },
  { value: "ly", label: "Libya", code: "+218", flag: "🇱🇾" },
  { value: "li", label: "Liechtenstein", code: "+423", flag: "🇱🇮" },
  { value: "lt", label: "Lithuania", code: "+370", flag: "🇱🇹" },
  { value: "lu", label: "Luxembourg", code: "+352", flag: "🇱🇺" },
  { value: "mo", label: "Macao", code: "+853", flag: "🇲🇴" },
  { value: "mk", label: "Macedonia", code: "+389", flag: "🇲🇰" },
  { value: "mg", label: "Madagascar", code: "+261", flag: "🇲🇬" },
  { value: "mw", label: "Malawi", code: "+265", flag: "🇲🇼" },
  { value: "my", label: "Malaysia", code: "+60", flag: "🇲🇾" },
  { value: "mv", label: "Maldives", code: "+960", flag: "🇲🇻" },
  { value: "ml", label: "Mali", code: "+223", flag: "🇲🇱" },
  { value: "mt", label: "Malta", code: "+356", flag: "🇲🇹" },
  { value: "mh", label: "Marshall Islands", code: "+692", flag: "🇲🇭" },
  { value: "mq", label: "Martinique", code: "+596", flag: "🇲🇶" },
  { value: "mr", label: "Mauritania", code: "+222", flag: "🇲🇷" },
  { value: "mu", label: "Mauritius", code: "+230", flag: "🇲🇺" },
  { value: "mx", label: "Mexico", code: "+52", flag: "🇲🇽" },
  { value: "fm", label: "Micronesia", code: "+691", flag: "🇫🇲" },
  { value: "md", label: "Moldova", code: "+373", flag: "🇲🇩" },
  { value: "mc", label: "Monaco", code: "+377", flag: "🇲🇨" },
  { value: "mn", label: "Mongolia", code: "+976", flag: "🇲🇳" },
  { value: "me", label: "Montenegro", code: "+382", flag: "🇲🇪" },
  { value: "ms", label: "Montserrat", code: "+1664", flag: "🇲🇸" },
  { value: "ma", label: "Morocco", code: "+212", flag: "🇲🇦" },
  { value: "mz", label: "Mozambique", code: "+258", flag: "🇲🇿" },
  { value: "mm", label: "Myanmar", code: "+95", flag: "🇲🇲" },
  { value: "na", label: "Namibia", code: "+264", flag: "🇳🇦" },
  { value: "nr", label: "Nauru", code: "+674", flag: "🇳🇷" },
  { value: "np", label: "Nepal", code: "+977", flag: "🇳🇵" },
  { value: "nl", label: "Netherlands", code: "+31", flag: "🇳🇱" },
  { value: "nc", label: "New Caledonia", code: "+687", flag: "🇳🇨" },
  { value: "nz", label: "New Zealand", code: "+64", flag: "🇳🇿" },
  { value: "ni", label: "Nicaragua", code: "+505", flag: "🇳🇮" },
  { value: "ne", label: "Niger", code: "+227", flag: "🇳🇪" },
  { value: "ng", label: "Nigeria", code: "+234", flag: "🇳🇬" },
  { value: "nu", label: "Niue", code: "+683", flag: "🇳🇺" },
  { value: "nf", label: "Norfolk Island", code: "+672", flag: "🇳🇫" },
  { value: "no", label: "Norway", code: "+47", flag: "🇳🇴" },
  { value: "om", label: "Oman", code: "+968", flag: "🇴🇲" },
  { value: "pk", label: "Pakistan", code: "+92", flag: "🇵🇰" },
  { value: "pw", label: "Palau", code: "+680", flag: "🇵🇼" },
  { value: "ps", label: "Palestine", code: "+970", flag: "🇵🇸" },
  { value: "pa", label: "Panama", code: "+507", flag: "🇵🇦" },
  { value: "pg", label: "Papua New Guinea", code: "+675", flag: "🇵🇬" },
  { value: "py", label: "Paraguay", code: "+595", flag: "🇵🇾" },
  { value: "pe", label: "Peru", code: "+51", flag: "🇵🇪" },
  { value: "ph", label: "Philippines", code: "+63", flag: "🇵🇭" },
  { value: "pl", label: "Poland", code: "+48", flag: "🇵🇱" },
  { value: "pt", label: "Portugal", code: "+351", flag: "🇵🇹" },
  { value: "pr", label: "Puerto Rico", code: "+1", flag: "🇵🇷" },
  { value: "qa", label: "Qatar", code: "+974", flag: "🇶🇦" },
  { value: "re", label: "Reunion", code: "+262", flag: "🇷🇪" },
  { value: "ro", label: "Romania", code: "+40", flag: "🇷🇴" },
  { value: "ru", label: "Russia", code: "+7", flag: "🇷🇺" },
  { value: "rw", label: "Rwanda", code: "+250", flag: "🇷🇼" },
  { value: "kn", label: "Saint Kitts and Nevis", code: "+1869", flag: "🇰🇳" },
  { value: "lc", label: "Saint Lucia", code: "+1758", flag: "🇱🇨" },
  { value: "vc", label: "Saint Vincent", code: "+1784", flag: "🇻🇨" },
  { value: "ws", label: "Samoa", code: "+685", flag: "🇼🇸" },
  { value: "sm", label: "San Marino", code: "+378", flag: "🇸🇲" },
  { value: "st", label: "Sao Tome and Principe", code: "+239", flag: "🇸🇹" },
  { value: "sa", label: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { value: "sn", label: "Senegal", code: "+221", flag: "🇸🇳" },
  { value: "rs", label: "Serbia", code: "+381", flag: "🇷🇸" },
  { value: "sc", label: "Seychelles", code: "+248", flag: "🇸🇨" },
  { value: "sl", label: "Sierra Leone", code: "+232", flag: "🇸🇱" },
  { value: "sg", label: "Singapore", code: "+65", flag: "🇸🇬" },
  { value: "sk", label: "Slovakia", code: "+421", flag: "🇸🇰" },
  { value: "si", label: "Slovenia", code: "+386", flag: "🇸🇮" },
  { value: "sb", label: "Solomon Islands", code: "+677", flag: "🇸🇧" },
  { value: "so", label: "Somalia", code: "+252", flag: "🇸🇴" },
  { value: "za", label: "South Africa", code: "+27", flag: "🇿🇦" },
  { value: "ss", label: "South Sudan", code: "+211", flag: "🇸🇸" },
  { value: "es", label: "Spain", code: "+34", flag: "🇪🇸" },
  { value: "lk", label: "Sri Lanka", code: "+94", flag: "🇱🇰" },
  { value: "sd", label: "Sudan", code: "+249", flag: "🇸🇩" },
  { value: "sr", label: "Suriname", code: "+597", flag: "🇸🇷" },
  { value: "sz", label: "Swaziland", code: "+268", flag: "🇸🇿" },
  { value: "se", label: "Sweden", code: "+46", flag: "🇸🇪" },
  { value: "ch", label: "Switzerland", code: "+41", flag: "🇨🇭" },
  { value: "sy", label: "Syria", code: "+963", flag: "🇸🇾" },
  { value: "tw", label: "Taiwan", code: "+886", flag: "🇹🇼" },
  { value: "tj", label: "Tajikistan", code: "+992", flag: "🇹🇯" },
  { value: "tz", label: "Tanzania", code: "+255", flag: "🇹🇿" },
  { value: "th", label: "Thailand", code: "+66", flag: "🇹🇭" },
  { value: "tl", label: "Timor-Leste", code: "+670", flag: "🇹🇱" },
  { value: "tg", label: "Togo", code: "+228", flag: "🇹🇬" },
  { value: "to", label: "Tonga", code: "+676", flag: "🇹🇴" },
  { value: "tt", label: "Trinidad and Tobago", code: "+1868", flag: "🇹🇹" },
  { value: "tn", label: "Tunisia", code: "+216", flag: "🇹🇳" },
  { value: "tr", label: "Turkey", code: "+90", flag: "🇹🇷" },
  { value: "tm", label: "Turkmenistan", code: "+993", flag: "🇹🇲" },
  { value: "tv", label: "Tuvalu", code: "+688", flag: "🇹🇻" },
  { value: "ug", label: "Uganda", code: "+256", flag: "🇺🇬" },
  { value: "ua", label: "Ukraine", code: "+380", flag: "🇺🇦" },
  { value: "ae", label: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
  { value: "gb", label: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { value: "us", label: "United States", code: "+1", flag: "🇺🇸" },
  { value: "uy", label: "Uruguay", code: "+598", flag: "🇺🇾" },
  { value: "uz", label: "Uzbekistan", code: "+998", flag: "🇺🇿" },
  { value: "vu", label: "Vanuatu", code: "+678", flag: "🇻🇺" },
  { value: "va", label: "Vatican City", code: "+39", flag: "🇻🇦" },
  { value: "ve", label: "Venezuela", code: "+58", flag: "🇻🇪" },
  { value: "vn", label: "Vietnam", code: "+84", flag: "🇻🇳" },
  { value: "vi", label: "Virgin Islands, U.S.", code: "+1340", flag: "🇻🇮" },
  { value: "ye", label: "Yemen", code: "+967", flag: "🇾🇪" },
  { value: "zm", label: "Zambia", code: "+260", flag: "🇿🇲" },
  { value: "zw", label: "Zimbabwe", code: "+263", flag: "🇿🇼" },
];

interface CountrySelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Export the CountrySelect component
export function CountrySelect({ value = "", onChange, placeholder = "Select country..." }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(
    value ? value.split(" ")[0] : "us"
  );
  const [phoneNumber, setPhoneNumber] = useState<string>(
    value ? value.split(" ").slice(1).join(" ") : ""
  );

  const selectedCountryData = countries.find((country) => country.value === selectedCountry);

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    const countryData = countries.find((c) => c.value === country);
    const newValue = `${countryData?.code || ""} ${phoneNumber}`;
    onChange(newValue.trim());
    setOpen(false);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);
    const newValue = `${selectedCountryData?.code || ""} ${newPhoneNumber}`;
    onChange(newValue.trim());
  };

  return (
    <div className="flex space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[90px] justify-between h-9 py-1"
          >
            {selectedCountryData ? (
              <>
                <span className="mr-1">{selectedCountryData.flag}</span>
                <span className="truncate">{selectedCountryData.code}</span>
              </>
            ) : (
              <span>Select</span>
            )}
            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Search country..." className="h-9" />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-[250px] overflow-auto">
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={country.value}
                  onSelect={handleCountrySelect}
                  className="flex items-center py-1"
                >
                  <span className="mr-2">{country.flag}</span>
                  <span>{country.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {country.code}
                  </span>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      selectedCountry === country.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        placeholder="Enter phone number"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        className="flex-1 h-9"
      />
    </div>
  );
}

// Also export as default for compatibility
export default CountrySelect; 
package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type Root struct {
	body []Puzzle `json:"body"`
}

type Puzzle struct {
	cells []Cell `json:"cells"`
	clues []Clue `json:"clues"`
}

type Cell struct {
	answer string `json:"answer"`
	label  string `json:"label"`
}

type Clue struct {
	cells     []int    `json:"cells"`
	direction string   `json:"direction"`
	label     string   `json:"label"`
	text      ClueText `json:"text"`
}

type ClueText struct {
	text string `json:plain`
}

func downloadDate(date string) error {

	client := &http.Client{}

	url := fmt.Sprintf("https://www.nytimes.com/svc/crosswords/v6/puzzle/mini/%s.json", date)

	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		return fmt.Errorf("failed to create request to %s: %w", url, err)
	}

	req.Header.Set("Cookie", "nyt-a=Thdshpbln7g50nF88E6gTG; nyt-b3-traceid=49f2a573d8364d798b08c46d0f4bc9b2; nyt-tos-viewed=true; purr-pref-agent=<G_<C_<T0<Tp1_<Tp2_<Tp3_<Tp4_<Tp7_<a12; nyt-purr=cfhhcfhhhukfhufhhgah2fdnd; _cb=PLpsvDkBUhjBBrAtw; _gcl_au=1.1.1058676860.1742077142; _scid=AmqaeZs85gqvpHMpHRG8chh_VvfJM5VB; purr-cache=<G_<C_<T0<Tp1_<Tp2_<Tp3_<Tp4_<Tp7_<a0_<K0<S0<r<ur; nyt-auth-method=sso; _v__chartbeat3=Djg2yMMgvCQC7Xp75; iter_id=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOiI2MmJhNTYyMDE3YTFlMTAwMDE2MTFkMDciLCJhaWRfZXh0Ijp0cnVlLCJjb21wYW55X2lkIjoiNWMwOThiM2QxNjU0YzEwMDAxMmM2OGY5IiwiaWF0IjoxNzQ0MzIzODUzfQ.P9PKxNLXWGEMidjI5BQmOgDnzFi2LPYaIad1LPNPmtM; _sctr=1%7C1744923600000; _scid_r=HOqaeZs85gqvpHMpHRG8chh_VvfJM5VB2AnJsg; _fbp=fb.1.1745009894084.755094304834171252; _ga_7JY7T788PK=GS1.1.1745012371.1.0.1745012374.0.0.0; regi_cookie=regi_id=152346309; nyt-traceid=000000000000000048c800654b1ad457; _ga=GA1.2.1181225254.1745012372; nyt-m=8B4CD52678FC816FD6BA74BF57E37DD9&cav=i.0&iue=i.0&iir=i.0&s=s.core&t=i.1&er=i.1745933662&vr=l.4.0.0.0.0&prt=i.0&n=i.2&igf=i.0&e=i.1746108000&v=i.0&rc=i.0&pr=l.4.0.0.0.0&ft=i.0&g=i.0&uuid=s.d12b5eb6-9057-4122-be09-b26cb11f00d9&ifv=i.0&igd=i.0&iru=i.1&ira=i.0&vp=i.0&fv=i.0&imu=i.1&ier=i.0&iub=i.0&iga=i.0&imv=i.0&igu=i.1&ica=i.0&ird=i.0; nyt-gdpr=0; nyt-geo=IL; __gads=ID=e3c6e45d05af4019:T=1742077141:RT=1746262022:S=ALNI_Ma9PeiWigXZBQgCkIUy1q1J6ZqVhw; __eoi=ID=c6ff9de6bcc80196:T=1742077141:RT=1746262022:S=AA-Afjb0wMcv_kKr22iPYQXa0UGM; nyt-jkidd=uid=152346309&lastRequest=1746262022979&activeDays=%5B0%2C1%2C1%2C1%2C1%2C0%2C1%2C0%2C0%2C1%2C0%2C1%2C1%2C1%2C1%2C1%2C1%2C1%2C1%2C0%2C1%2C0%2C1%2C1%2C1%2C1%2C1%2C1%2C1%2C1%5D&adv=23&a7dv=7&a14dv=12&a21dv=18&lastKnownType=sub&newsStartDate=&entitlements=XWD; _chartbeat2=.1742077141684.1746262022653.1111100111111111.CBmVMFDCbNE2BAYpgJDfyi00DhsSC0.1; datadome=aP6BeDHtBZIhVHQQMdv13yVKODpCCEnDCoWyjpoPrbBEb8RTQhwWLbigCGYcTPRJGSK6eSqCE8kq7UEpGiO4t2JPafxVPISHCpVrSFZuCkjl2CQFHE46IcpLZ8eef4ER; NYT-S=0^CBsSMQjyiOG_BhCG29fABhoSMS2qLb8vefNknriFctxMfD_lIMW90kgqAgACOImcrP0FQgAaQMogNiHh0N-sp1zOSFkWemnjSqvhMN6l66qVS-_YtokTNMKw-ABM-W6QhQSYX-AUfFo_oMvJOBrkHDSDDgQ2VAE=; SIDNY=CBsSMQjyiOG_BhCG29fABhoSMS2qLb8vefNknriFctxMfD_lIMW90kgqAgACOImcrP0FQgAaQMogNiHh0N-sp1zOSFkWemnjSqvhMN6l66qVS-_YtokTNMKw-ABM-W6QhQSYX-AUfFo_oMvJOBrkHDSDDgQ2VAE=; _dd_s=")

	resp, err := client.Do(req)

	if err != nil {
		return fmt.Errorf("failed to send request to %s: %w", url, err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("server rejected %s with status %d", url, resp.StatusCode)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return err
	}

	filename := fmt.Sprintf("minis/%s.json", date)

	err = os.WriteFile(filename, body, 0644)

	if err != nil {
		return err
	}

	fmt.Println("Downloaded:", date)

	return nil
}

func main() {

	for y := 2024; y < 2025; y++ {
		for m := 12; m <= 12; m++ {
			for d := 25; d <= 31; d++ {

				dateTime, err := time.Parse("2006-01-02", fmt.Sprintf("%04d-%02d-%02d", y, m, d))
				if err != nil {
					// it's not a date
					continue
				}

				date := dateTime.Format("2006-01-02")

				err = downloadDate(date)

				if err != nil {
					fmt.Printf("Error On Date %s: %s\n", date, err.Error())
				}

			}
		}
	}

}

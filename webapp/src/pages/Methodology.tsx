import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import { rankToNum } from "../data/players";

export const MethodologyPage = () => (
  <Container>
    <Card style={{ margin: "1em 0" }}>
      <Card.Body>
        <h5 className="display-5 text-center">Methodology</h5>
        <br />

        <h3 className="text-center">Keeping Our Team MMR Consistent</h3>
        <ul>
          <li><b>Forever duo: </b> My duo and I never played with anyone throughout all matches, preventing other teammates from skewing our MMR.</li>
          <li><b>Exclusively arena: </b> We only played arenas during this period to avoid having untracked games affect our MMR.</li>
        </ul>

        <h3 className="text-center">Gathering the Data</h3>
        <ul>
          <li><b>Match Information:</b> Match history, outcome, and timeline was gathered from the <a target="_blank" href="https://developer.riotgames.com/apis">Official Riot Games API</a></li>
          <li><b>Ranks:</b> Ranked stats were gathered from multiple sources. The current season ranks were gathered from the Riot Games API. However, I wanted the site to fill in the previous season's rank <i>only if the user has not placed this season</i>. The official API doesn't provide a way to do this so I had to rely on another stat aggregator who had had that data. Unfortunately they IP banned me around April 20th so previous rank stats end there, but that's the majority of the way through the dataset so I haven't felt too pressured to repeat the effort for OP.GG (who does allow scraping).</li>
        </ul>

        <h3 className="text-center">Identifying Bravery, Crowd Favorites, and Stat Anvils</h3>
        <ul>
          <li><b>Bravery: </b>Identified as any user who consumed the Bravery Voucher item (ID 220011)</li>
          <li><b>Crowd Favorite: </b>Identified as any user who consumed the Anvil Voucher item (different from purchasable shop vouchers): 220008</li>
          <li><b>Stat Anvil Runners: </b>Identified as any user who doesn't purchase an item before reaching level 7. Items gifted to the player (ie free pristmatic round) don't count here.</li>
        </ul>

        <h3 className="text-center">Averaging Ranks</h3>
        <ol>
          <li>
            Rank is converted to a number.
            <ul>
              <li>Tier is converted to an integer. Iron is 0, Silver is 1, Gold is 2, etc.</li>
              <li>Division is converted to a decimal and added to Tier. IV is 0, III is 0.25, II is 0.5, and I is 0.75.</li>
              <li>Eg Gold III: {rankToNum({ tier: "GOLD", rank: "III" })}</li>
            </ul>
          </li>
          <li>Numbers are averaged, sorted, etc like normal numbers.</li>
          <li>Numbers are converted back to a human-readable rank in the same way as before, rounding down.</li>
        </ol>
      </Card.Body>
    </Card>
  </Container>
);

export default MethodologyPage;


#include <iostream>
#include <fstream>
#include <vector>
#include <sstream>
#include <cstring>
#include <chrono>
#include <ctime>


using namespace std;

char* LoadFile(const char *source);
vector<string> explode(string const & s, char delim);
int Random(int nMax);
void WriteWordToFile(string sFile, string sWord);

int main(int argc, char **argv) {

    char * p_cWords = LoadFile("/srv/http/6lets/Todays6LetWordList.txt");

    int length = strlen(p_cWords) * sizeof(char);
    cout << "Length: " << length << endl;

    auto v = explode(p_cWords, '\n');
    int nCount = v.size();
    cout << "Count: " << nCount << endl;

    int nRand = Random(nCount);
    cout << "Rand: " << nRand << endl;
    cout << "Word: " << v[nRand] << endl;

    WriteWordToFile("/srv/http/6lets/Todays6LetWord.txt", v[nRand]);

    char * p_cTries = LoadFile("/srv/http/6lets/6LetTries.txt");

    auto t = explode(p_cTries, ',');

    int nT = stoi(t[0]);
    nT = nT + 1;
    cout << "Game #: " << nT << endl;

    int nTraffic = 0;
    for (int c=1; c<12; c++) {
        nTraffic += stoi(t[c]);
        cout << c << ". " << stoi(t[c])  << endl;
    }

    cout << nTraffic << endl;

    char * p_cTraffic = LoadFile("/srv/http/6lets/Traffic.txt");
    auto now = std::chrono::system_clock::now();
    time_t now_time = chrono::system_clock::to_time_t(now);
    char * c_pRightNow = ctime(&now_time);
    string sSpace = " players on ";
    string sTraffic = to_string(nTraffic) + sSpace + c_pRightNow + "\n" + p_cTraffic + "\0";
    cout << "Traffic: " + sTraffic << endl;
    WriteWordToFile("/srv/http/6lets/Traffic.txt", sTraffic);

    string sTries = to_string(nT) + ",0,0,0,0,0,0,0,0,0,0,0,0";

    cout << sTries << endl;

    WriteWordToFile("/srv/http/6lets/6LetTries.txt", sTries);

    free(p_cTraffic);
    free(p_cWords);
    free (p_cTries);

    exit(0);
}

void WriteWordToFile(string sFile, string sWord) {
    ofstream WordFile(sFile);
    WordFile << sWord;
    WordFile.close();
}

vector<string> explode(string const & s, char delim) {
    vector<string> result;
    istringstream iss(s);

    for (string token; getline(iss, token, delim); ) {
        result.push_back(move(token));
    }

    return result;
}

int Random(int nMax) {
    srand(time(0));
    return rand()%nMax;
}

char* LoadFile(const char *source) {
    char * buffer = 0;
    long length = 0;
    FILE *s = fopen (source, "r");
    if (s) {
        fseek (s, 0, SEEK_END);
        length = ftell (s);
        fseek (s, 0, SEEK_SET);
        buffer = (char*) malloc (length);
        buffer[length-1] = '\0';
        if (buffer) {
            fread (buffer, 1, length, s);
        }
        fclose (s);
    }
    return buffer;
}


// g++ /srv/http/6lets/6lets.cpp -o /srv/http/6lets/6lets

// 0 0 * * * /srv/http/6lets/./6lets
// 0 12 * * * /srv/http/6lets/./6lets

// 172.116.51.78:55112

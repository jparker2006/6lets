
#include <iostream>
#include <fstream>
#include <vector>
#include <sstream>
#include <cstring>


using namespace std;

char* LoadFile(const char *source);
vector<string> explode(string const & s, char delim);
int Random(int nMax);
void WriteWordToFile(string sFile, string sWord);

int main(int argc, char **argv) {

    char * p_cWords = LoadFile("/srv/http/6lets/TodaysWordList.txt");

    int length = strlen(p_cWords) * sizeof(char);
    cout << "Length: " << length << endl;

    auto v = explode(p_cWords, '\n');
    int nCount = v.size();
    cout << "Count: " << nCount << endl;

    int nRand = Random(nCount);
    cout << "Rand: " << nRand << endl;
    cout << "Word: " << v[nRand] << endl;

    string sWordFile = "<?php\necho \"" + v[nRand] + "\";\n?>";

    WriteWordToFile("/srv/http/6lets/TodaysWord.php", sWordFile);

    WriteWordToFile("/srv/http/6lets/TodaysWord.txt", v[nRand]);

    char * p_cTries = LoadFile("/srv/http/6lets/Tries.txt");

    auto t = explode(p_cTries, ',');

    int nT = stoi(t[0]);
    nT = nT + 1;
    cout << "Game #: " << nT << endl;

    string sTries = to_string(nT) + ",0,0,0,0,0,0,0,0,0,0,0";

    cout << sTries;

    WriteWordToFile("/srv/http/6lets/Tries.txt", sTries);

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

// 0 9 * * * /srv/http/6lets/./6lets
// 0 21 * * * /srv/http/6lets/./6lets

// 172.116.51.78:55112

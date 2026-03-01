use std::path::PathBuf;

use super::error::LcuError;

#[derive(Debug, Clone)]
pub struct LockfileData {
    pub process_name: String,
    pub pid: u32,
    pub port: u16,
    pub password: String,
    pub protocol: String,
}

fn get_macos_lockfile_paths() -> Vec<PathBuf> {
    let home = std::env::var("HOME").unwrap_or_default();

    vec![
        PathBuf::from(&home).join("Library/Application Support/League of Legends/lockfile"),
        PathBuf::from("/Applications/League of Legends.app/Contents/LoL/lockfile"),
        PathBuf::from(&home)
            .join("Library/Application Support/Riot Games/League of Legends/lockfile"),
    ]
}

pub fn find_lockfile_path() -> Option<PathBuf> {
    get_macos_lockfile_paths()
        .into_iter()
        .find(|path| path.exists())
}

pub fn get_lockfile_watch_dir() -> Option<PathBuf> {
    find_lockfile_path().and_then(|p| p.parent().map(PathBuf::from))
}

pub fn parse_lockfile(content: &str) -> Result<LockfileData, LcuError> {
    let trimmed = content.trim();
    let parts: Vec<&str> = trimmed.split(':').collect();

    if parts.len() < 5 {
        return Err(LcuError::LockfileParseError {
            raw: trimmed.to_string(),
        });
    }

    let pid = parts[1].parse::<u32>().map_err(|_| LcuError::LockfileParseError {
        raw: trimmed.to_string(),
    })?;

    let port = parts[2].parse::<u16>().map_err(|_| LcuError::LockfileParseError {
        raw: trimmed.to_string(),
    })?;

    Ok(LockfileData {
        process_name: parts[0].to_string(),
        pid,
        port,
        password: parts[3].to_string(),
        protocol: parts[4].to_string(),
    })
}

pub fn read_lockfile() -> Result<LockfileData, LcuError> {
    let path = find_lockfile_path().ok_or(LcuError::LockfileNotFound)?;
    let content = std::fs::read_to_string(&path).map_err(|_| LcuError::LockfileNotFound)?;
    parse_lockfile(&content)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_lockfile_valid() {
        let content = "LeagueClient:12345:57732:abc123token:https";
        let data = parse_lockfile(content).unwrap();
        assert_eq!(data.process_name, "LeagueClient");
        assert_eq!(data.pid, 12345);
        assert_eq!(data.port, 57732);
        assert_eq!(data.password, "abc123token");
        assert_eq!(data.protocol, "https");
    }

    #[test]
    fn test_parse_lockfile_with_whitespace() {
        let content = "LeagueClient:12345:57732:abc123token:https\n";
        let data = parse_lockfile(content).unwrap();
        assert_eq!(data.port, 57732);
    }

    #[test]
    fn test_parse_lockfile_invalid_format() {
        let content = "invalid:data";
        assert!(parse_lockfile(content).is_err());
    }

    #[test]
    fn test_parse_lockfile_invalid_port() {
        let content = "LeagueClient:12345:notaport:abc:https";
        assert!(parse_lockfile(content).is_err());
    }
}
